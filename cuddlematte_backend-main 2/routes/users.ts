import { Router } from 'express';
import auth from '../middleware/auth';
import upload from '../middleware/upload';
import { 
  profileUpdateValidation,
  locationUpdateValidation,
  emailUpdateValidation,
  kycSubmissionValidation,
  validate 
} from '../middleware/validation';
import {
  getMyProfile,
  updateMyProfile,
  updateLocation,
  addPhoto,
  deletePhoto,
  getUserById,
  updatePreferences,
  updateEmail,
  submitKyc
} from '../controllers/userController';

const router = Router();

router.get('/me', auth, getMyProfile);
router.put('/me', auth, profileUpdateValidation, validate, updateMyProfile);
router.put('/me/location', auth, locationUpdateValidation, validate, updateLocation);
router.put('/me/email', auth, emailUpdateValidation, validate, updateEmail);
router.post(
  '/me/kyc',
  auth,
  upload.fields([
    { name: 'licenseFront', maxCount: 1 },
    { name: 'licenseBack', maxCount: 1 }
  ]),
  kycSubmissionValidation,
  validate,
  submitKyc
);
router.post('/me/photos', auth, upload.single('file'), addPhoto);
router.delete('/me/photos/:index', auth, deletePhoto);
router.put('/me/preferences', auth, updatePreferences);
router.get('/:userId', auth, getUserById);

export default router;
