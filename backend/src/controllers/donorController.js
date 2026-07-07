import Donor from '../models/Donor.js';
import BloodRequest from '../models/BloodRequest.js';
import Notification from '../models/Notification.js';
import Acceptance from '../models/Acceptance.js';
import { io } from '../server.js';

// @desc    Get donor profile
// @route   GET /api/donor/profile
// @access  Private (Donor)
export const getProfile = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.user.userId).select('-password');
    if (donor) {
      res.json({ success: true, data: donor });
    } else {
      res.status(404).json({ success: false, message: 'Donor not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update donor profile
// @route   PUT /api/donor/profile
// @access  Private (Donor)
export const updateProfile = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.user.userId);
    
    if (donor) {
      donor.phone = req.body.phone || donor.phone;
      donor.address = req.body.address || donor.address;
      if (req.body.available !== undefined) {
        donor.available = req.body.available;
      }
      if (req.body.lastDonationDate) {
        donor.lastDonationDate = req.body.lastDonationDate;
      }

      const updatedDonor = await donor.save();
      const donorObj = updatedDonor.toObject();
      delete donorObj.password;

      res.json({ success: true, data: donorObj });
    } else {
      res.status(404).json({ success: false, message: 'Donor not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update donor location
// @route   PUT /api/donor/location
// @access  Private (Donor)
export const updateLocation = async (req, res, next) => {
  try {
    const { longitude, latitude } = req.body;
    
    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({ success: false, message: 'Longitude and latitude are required' });
    }

    const donor = await Donor.findById(req.user.userId);
    if (donor) {
      donor.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
      await donor.save();
      res.json({ success: true, message: 'Location updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Donor not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor notifications
// @route   GET /api/donor/notifications
// @access  Private (Donor)
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ donorId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Sort unread first (status SENT)
    notifications.sort((a, b) => {
      if (a.status === 'SENT' && b.status === 'READ') return -1;
      if (a.status === 'READ' && b.status === 'SENT') return 1;
      return 0;
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/donor/notifications/:id/read
// @access  Private (Donor)
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, donorId: req.user.userId });
    
    if (notification) {
      notification.status = 'READ';
      await notification.save();
      res.json({ success: true, message: 'Notification marked as read' });
    } else {
      res.status(404).json({ success: false, message: 'Notification not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get active blood requests for donor
// @route   GET /api/donor/requests
// @access  Private (Donor)
export const getActiveRequests = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.user.userId);
    
    // Find requests matching donor blood group
    const requests = await BloodRequest.find({
      bloodGroup: donor.bloodGroup,
      status: 'ACTIVE'
    }).populate('hospitalId', 'hospitalName address location').sort({ urgency: -1, createdAt: -1 }).lean();

    // Ideally, we could also filter by distance here, but for simplicity, we return all matching active ones
    // We can compute distance and sort if needed
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept blood request
// @route   POST /api/donor/request/:id/accept
// @access  Private (Donor)
export const acceptRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const donorId = req.user.userId;

    const request = await BloodRequest.findById(requestId).populate('hospitalId', 'hospitalName');
    const donor = await Donor.findById(donorId);

    // 1. Verify request exists
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // 2. Verify request is ACTIVE
    if (request.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Request is no longer active' });
    }

    // 3. Verify donor blood group matches request
    if (donor.bloodGroup !== request.bloodGroup) {
      return res.status(400).json({ success: false, message: 'Blood group mismatch' });
    }

    // 4. Verify donor has not already accepted
    const existingAcceptance = await Acceptance.findOne({ donorId, requestId });
    if (existingAcceptance) {
      return res.status(400).json({ success: false, message: 'You have already accepted this request' });
    }

    // 5. Verify unitsRemaining > 0
    if (request.unitsRemaining <= 0) {
      return res.status(400).json({ success: false, message: 'Request already fulfilled' });
    }

    // 6. Create Acceptance document
    await Acceptance.create({ donorId, requestId });

    // 7. Decrease unitsRemaining by 1
    request.unitsRemaining -= 1;

    // 8. If unitsRemaining becomes 0, mark request COMPLETED
    if (request.unitsRemaining === 0) {
      request.status = 'COMPLETED';
    }

    await request.save();

    // Emit Socket events
    if (io) {
      // Notify hospital that a donor accepted
      io.emit('donor-accepted', {
        requestId: request._id,
        hospitalId: request.hospitalId._id,
        unitsRemaining: request.unitsRemaining,
        donor: {
          name: donor.name,
          phone: donor.phone,
          bloodGroup: donor.bloodGroup
        }
      });

      // If completed, emit completion event
      if (request.status === 'COMPLETED') {
        io.emit('request-completed', {
          requestId: request._id,
          hospitalId: request.hospitalId._id
        });
      }
    }

    res.json({
      success: true,
      message: 'Request accepted successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};
