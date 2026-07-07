import jwt from 'jsonwebtoken';
import Donor from '../models/Donor.js';
import Hospital from '../models/Hospital.js';

export const protect = async (req, res, next) => {
  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };

      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export const donorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'donor') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as a donor' });
  }
};

export const hospitalOnly = (req, res, next) => {
  if (req.user && req.user.role === 'hospital') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as a hospital' });
  }
};
