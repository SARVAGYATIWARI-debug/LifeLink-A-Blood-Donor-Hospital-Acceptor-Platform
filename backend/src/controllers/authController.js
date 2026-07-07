import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Donor from '../models/Donor.js';
import Hospital from '../models/Hospital.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new donor
// @route   POST /api/auth/donor/register
// @access  Public
export const registerDonor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, phone, password, bloodGroup, gender, age, address, longitude, latitude } = req.body;

    const donorExists = await Donor.findOne({ email });
    if (donorExists) {
      return res.status(400).json({ success: false, message: 'Donor already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const donor = await Donor.create({
      name,
      email,
      phone,
      password: hashedPassword,
      bloodGroup,
      gender,
      age,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      role: 'donor'
    });

    if (donor) {
      generateToken(res, donor._id, donor.role);
      res.status(201).json({
        success: true,
        data: {
          _id: donor._id,
          name: donor.name,
          email: donor.email,
          role: donor.role,
          bloodGroup: donor.bloodGroup,
          available: donor.available,
          lastDonationDate: donor.lastDonationDate,
          location: donor.location
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid donor data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new hospital
// @route   POST /api/auth/hospital/register
// @access  Public
export const registerHospital = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { hospitalName, email, phone, password, address, longitude, latitude } = req.body;

    const hospitalExists = await Hospital.findOne({ email });
    if (hospitalExists) {
      return res.status(400).json({ success: false, message: 'Hospital already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const hospital = await Hospital.create({
      hospitalName,
      email,
      phone,
      password: hashedPassword,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      role: 'hospital'
    });

    if (hospital) {
      generateToken(res, hospital._id, hospital.role);
      res.status(201).json({
        success: true,
        data: {
          _id: hospital._id,
          hospitalName: hospital.hospitalName,
          email: hospital.email,
          role: hospital.role
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid hospital data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth donor & get token
// @route   POST /api/auth/donor/login
// @access  Public
export const loginDonor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password, longitude, latitude } = req.body;

    const donor = await Donor.findOne({ email });

    if (donor && (await bcrypt.compare(password, donor.password))) {
      // Update location if provided
      if (longitude && latitude) {
        donor.location = {
          type: 'Point',
          coordinates: [longitude, latitude]
        };
        await donor.save();
      }

      generateToken(res, donor._id, donor.role);
      res.json({
        success: true,
        data: {
          _id: donor._id,
          name: donor.name,
          email: donor.email,
          role: donor.role,
          bloodGroup: donor.bloodGroup,
          available: donor.available,
          lastDonationDate: donor.lastDonationDate,
          location: donor.location
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth hospital & get token
// @route   POST /api/auth/hospital/login
// @access  Public
export const loginHospital = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password, longitude, latitude } = req.body;

    const hospital = await Hospital.findOne({ email });

    if (hospital && (await bcrypt.compare(password, hospital.password))) {
      // Update location if provided
      if (longitude && latitude) {
        hospital.location = {
          type: 'Point',
          coordinates: [longitude, latitude]
        };
        await hospital.save();
      }

      generateToken(res, hospital._id, hospital.role);
      res.json({
        success: true,
        data: {
          _id: hospital._id,
          hospitalName: hospital.hospitalName,
          email: hospital.email,
          role: hospital.role
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    let user;
    if (req.user.role === 'donor') {
      user = await Donor.findById(req.user.userId).select('-password');
    } else if (req.user.role === 'hospital') {
      user = await Hospital.findById(req.user.userId).select('-password');
    }

    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};
