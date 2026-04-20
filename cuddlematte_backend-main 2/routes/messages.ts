import { Router } from 'express';
import auth from '../middleware/auth';
import requireOnboarding from '../middleware/onboarding';
import { messageValidation, validate } from '../middleware/validation';
import {
  sendMessage,
  getConversation,
  markAsRead,
  getConversations,
  deleteMessage,
  getUnreadCount
} from '../controllers/messageController';

const router = Router();

router.post('/', auth, requireOnboarding, messageValidation, validate, sendMessage);
router.get('/conversations', auth, requireOnboarding, getConversations);
router.get('/unread/count', auth, requireOnboarding, getUnreadCount);
router.get('/conversation/:matchUserId', auth, requireOnboarding, getConversation);
router.put('/read/:matchUserId', auth, requireOnboarding, markAsRead);
router.delete('/:messageId', auth, requireOnboarding, deleteMessage);

export default router;
