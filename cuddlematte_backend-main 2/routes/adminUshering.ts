import { Router } from 'express';
import auth from '../middleware/auth';
import adminAuth from '../middleware/adminAuth';
import {
  validate,
  usheringAdminResponseValidation,
  usheringAdminFulfillValidation
} from '../middleware/validation';
import {
  adminListUsheringRequests,
  adminRespondUsheringRequest,
  adminFulfillUsheringRequest
} from '../controllers/adminUsheringController';

const router = Router();

router.use(auth, adminAuth);

router.get('/requests', adminListUsheringRequests);
router.put('/requests/:requestId/respond', usheringAdminResponseValidation, validate, adminRespondUsheringRequest);
router.put('/requests/:requestId/fulfill', usheringAdminFulfillValidation, validate, adminFulfillUsheringRequest);

export default router;
