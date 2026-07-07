import { check } from 'express-validator';

export const createRequestValidator = [
  check('bloodGroup', 'Valid blood group is required').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  check('unitsRequired', 'Units required must be a positive number').isInt({ min: 1 }),
  check('urgency', 'Valid urgency is required').isIn(['Normal', 'High', 'Critical'])
];
