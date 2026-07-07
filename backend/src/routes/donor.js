import express from 'express';
import {
  getProfile,
  updateProfile,
  updateLocation,
  getNotifications,
  markNotificationRead,
  getActiveRequests,
  acceptRequest
} from '../controllers/donorController.js';
import { protect, donorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(donorOnly);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.put('/location', updateLocation);

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

router.get('/requests', getActiveRequests);
router.post('/request/:id/accept', acceptRequest);

export default router;
