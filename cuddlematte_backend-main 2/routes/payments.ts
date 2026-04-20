import { Router } from 'express';
import auth from '../middleware/auth';
import { initializePayment, verifyPayment } from '../controllers/paymentController';

const router = Router();

router.use(auth);

router.post('/paystack/initialize', initializePayment);
router.get('/paystack/verify/:reference', verifyPayment);

export default router;
