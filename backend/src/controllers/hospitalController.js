import { validationResult } from 'express-validator';
import Hospital from '../models/Hospital.js';
import BloodRequest from '../models/BloodRequest.js';
import Acceptance from '../models/Acceptance.js';
import { findAndNotifyEligibleDonors } from '../services/matchingService.js';

// @desc    Get hospital profile
// @route   GET /api/hospital/profile
// @access  Private (Hospital)
export const getProfile = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.user.userId).select('-password');
    if (hospital) {
      res.json({ success: true, data: hospital });
    } else {
      res.status(404).json({ success: false, message: 'Hospital not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a blood request
// @route   POST /api/hospital/request
// @access  Private (Hospital)
export const createBloodRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { bloodGroup, unitsRequired, urgency } = req.body;

    const hospital = await Hospital.findById(req.user.userId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const bloodRequest = await BloodRequest.create({
      hospitalId: hospital._id,
      bloodGroup,
      unitsRequired,
      unitsRemaining: unitsRequired,
      urgency,
      location: hospital.location,
      status: 'ACTIVE'
    });

    // Run matching and notification asynchronously
    findAndNotifyEligibleDonors(bloodRequest, hospital).catch(err => {
      console.error('Error in matching service:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: bloodRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hospital dashboard stats and requests
// @route   GET /api/hospital/dashboard
// @access  Private (Hospital)
export const getDashboard = async (req, res, next) => {
  try {
    const hospitalId = req.user.userId;

    const allRequests = await BloodRequest.find({ hospitalId }).sort({ createdAt: -1 }).lean();
    
    // Count total acceptances for this hospital's requests
    const requestIds = allRequests.map(req => req._id);
    const acceptedDonorsCount = await Acceptance.countDocuments({ requestId: { $in: requestIds } });

    res.json({
      success: true,
      data: {
        stats: {
          totalActiveRequests: allRequests.filter(r => r.status === 'ACTIVE').length,
          totalCompletedRequests: allRequests.filter(r => r.status === 'COMPLETED').length,
          totalAcceptedDonors: acceptedDonorsCount
        },
        recentRequests: allRequests.slice(0, 10) // Send top 10 recent requests (active + completed)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific request details
// @route   GET /api/hospital/request/:id
// @access  Private (Hospital)
export const getRequestDetails = async (req, res, next) => {
  try {
    const request = await BloodRequest.findOne({ _id: req.params.id, hospitalId: req.user.userId }).lean();
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const acceptances = await Acceptance.find({ requestId: request._id })
      .populate('donorId', 'name phone bloodGroup')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        request,
        acceptances
      }
    });
  } catch (error) {
    next(error);
  }
};
