import { Router } from 'express';
import auth from '../middleware/auth';
import requireOnboarding from '../middleware/onboarding';
import {
  requestConnect,
  acceptConnect,
  declineConnect,
  listConnections
} from '../controllers/connectController';

const router = Router();

router.post('/request/:targetUserId', auth, requireOnboarding, requestConnect);
router.put('/accept/:requestId', auth, requireOnboarding, acceptConnect);
router.put('/decline/:requestId', auth, requireOnboarding, declineConnect);
router.get('/', auth, requireOnboarding, listConnections);

export default router;
