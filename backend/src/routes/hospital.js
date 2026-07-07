import express from 'express';
import {
  getProfile,
  createBloodRequest,
  getDashboard,
  getRequestDetails
} from '../controllers/hospitalController.js';
import { protect, hospitalOnly } from '../middleware/authMiddleware.js';
import { createRequestValidator } from '../validators/hospitalValidator.js';

const router = express.Router();

router.use(protect);
router.use(hospitalOnly);

router.get('/profile', getProfile);
router.get('/dashboard', getDashboard);
router.post('/request', createRequestValidator, createBloodRequest);
router.get('/request/:id', getRequestDetails);

export default router;
