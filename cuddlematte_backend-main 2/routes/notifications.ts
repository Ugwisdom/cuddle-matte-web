import { Router } from 'express';
import auth from '../middleware/auth';
import requireOnboarding from '../middleware/onboarding';
import {
  listNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification
} from '../controllers/notificationController';

const router = Router();

router.get('/', auth, requireOnboarding, listNotifications);
router.put('/read/:notificationId', auth, requireOnboarding, markNotificationRead);
router.put('/read-all', auth, requireOnboarding, markAllRead);
router.delete('/:notificationId', auth, requireOnboarding, deleteNotification);

export default router;
