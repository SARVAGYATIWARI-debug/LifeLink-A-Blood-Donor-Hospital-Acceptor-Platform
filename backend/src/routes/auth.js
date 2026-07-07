import express from 'express';
import {
  registerDonor,
  registerHospital,
  loginDonor,
  loginHospital,
  logoutUser,
  getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerDonorValidator, registerHospitalValidator, loginValidator } from '../validators/authValidator.js';

const router = express.Router();

router.post('/donor/register', registerDonorValidator, registerDonor);
router.post('/hospital/register', registerHospitalValidator, registerHospital);
router.post('/donor/login', loginValidator, loginDonor);
router.post('/hospital/login', loginValidator, loginHospital);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export default router;
