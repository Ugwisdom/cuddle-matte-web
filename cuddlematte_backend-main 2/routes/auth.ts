import { Router } from 'express';
import auth from '../middleware/auth';
import { 
  registerValidation, 
  loginValidation,
  onboardingValidation,
  emailVerificationValidation,
  validate 
} from '../middleware/validation';
import {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
  deactivateAccount,
  completeOnboarding,
  requestEmailVerification,
  verifyEmailCode
} from '../controllers/authController';

const router = Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logout);
router.put('/password', auth, changePassword);
router.post('/onboarding', auth, onboardingValidation, validate, completeOnboarding);
router.post('/email/request', requestEmailVerification);
router.post('/email/verify', emailVerificationValidation, validate, verifyEmailCode);
router.delete('/account', auth, deactivateAccount);

export default router;
