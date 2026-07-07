import { check } from 'express-validator';

export const registerDonorValidator = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Phone number is required').not().isEmpty(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('bloodGroup', 'Valid blood group is required').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  check('longitude', 'Longitude is required').isFloat(),
  check('latitude', 'Latitude is required').isFloat()
];

export const registerHospitalValidator = [
  check('hospitalName', 'Hospital Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Phone number is required').not().isEmpty(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('address', 'Address is required').not().isEmpty(),
  check('longitude', 'Longitude is required').isFloat(),
  check('latitude', 'Latitude is required').isFloat()
];

export const loginValidator = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  check('longitude', 'Longitude must be a number').optional().isFloat(),
  check('latitude', 'Latitude must be a number').optional().isFloat()
];
