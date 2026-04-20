import { Router } from 'express';
import auth from '../middleware/auth';
import requireOnboarding from '../middleware/onboarding';
import { validate, usheringRequestValidation } from '../middleware/validation';
import {
  createUsheringRequest,
  listMyUsheringRequests
} from '../controllers/usheringController';

const router = Router();

router.post('/requests', auth, requireOnboarding, usheringRequestValidation, validate, createUsheringRequest);
router.get('/requests', auth, requireOnboarding, listMyUsheringRequests);

export default router;
