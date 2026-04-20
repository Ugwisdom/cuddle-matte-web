import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: (err as any).path || (err as any).param,
        message: err.msg
      }))
    });
  }
  
  next();
};

const registerValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9_]+$/i).withMessage('Username can only contain letters, numbers, and underscores'),
  body('dateOfBirth')
    .isISO8601().withMessage('Please enter a valid date of birth')
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 18) {
        throw new Error('You must be at least 18 years old');
      }
      return true;
    }),
  body('gender')
    .isIn(['male', 'female', 'non-binary', 'other']).withMessage('Invalid gender'),
  body('interestedIn')
    .isArray({ min: 1 }).withMessage('Please select at least one preference')
    .custom((value) => {
      const validGenders = ['male', 'female', 'non-binary', 'other'];
      return value.every(g => validGenders.includes(g));
    }).withMessage('Invalid gender preferences'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters')
    .matches(/^[A-Za-z][A-Za-z\s.'-]*$/).withMessage('City contains invalid characters')
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const onboardingValidation = [
  body('dateOfBirth')
    .isISO8601().withMessage('Please enter a valid date of birth')
    .custom((value) => {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        throw new Error('You must be at least 18 years old');
      }
      return true;
    }),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters')
    .matches(/^[A-Za-z][A-Za-z\s.'-]*$/).withMessage('City contains invalid characters')
];

const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9_]+$/i).withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters')
    .matches(/^[A-Za-z][A-Za-z\s.'-]*$/).withMessage('City contains invalid characters'),
  body('profilePic')
    .optional()
    .matches(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i).withMessage('Invalid profile picture URL'),
  body('bannerPic')
    .optional()
    .matches(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i).withMessage('Invalid banner picture URL'),
  body('photos')
    .optional()
    .isArray().withMessage('Photos must be an array'),
  body('preferences.ageRange.min')
    .optional()
    .isInt({ min: 18, max: 100 }).withMessage('Minimum age must be between 18 and 100'),
  body('preferences.ageRange.max')
    .optional()
    .isInt({ min: 18, max: 100 }).withMessage('Maximum age must be between 18 and 100'),
  body('preferences.maxDistance')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('Maximum distance must be between 1 and 500 km')
];

const locationUpdateValidation = [
  body('longitude')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('latitude')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude')
];

const messageValidation = [
  body('recipientId')
    .notEmpty().withMessage('Recipient ID is required')
    .isMongoId().withMessage('Invalid recipient ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
];

const emailUpdateValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const emailVerificationValidation = [
  body('code')
    .trim()
    .isLength({ min: 4, max: 10 }).withMessage('Verification code is required'),
  body('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email')
    .custom((value, { req }) => {
      if (!req.userId && !value) {
        throw new Error('Email is required');
      }
      return true;
    })
];

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const kycSubmissionValidation = [
  body('licenseFrontUrl')
    .custom((value, { req }) => {
      const files = (req as any).files || {};
      if (files.licenseFront?.length) {
        return true;
      }
      if (!value) {
        throw new Error('License front is required');
      }
      if (!isValidUrl(String(value))) {
        throw new Error('License front URL must be a valid URL');
      }
      return true;
    }),
  body('licenseBackUrl')
    .custom((value, { req }) => {
      const files = (req as any).files || {};
      if (files.licenseBack?.length) {
        return true;
      }
      if (!value) {
        throw new Error('License back is required');
      }
      if (!isValidUrl(String(value))) {
        throw new Error('License back URL must be a valid URL');
      }
      return true;
    })
];

const usheringRequestValidation = [
  body('girlsRequested')
    .isInt({ min: 1 }).withMessage('Girls requested must be at least 1'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Location must be between 2 and 200 characters'),
  body('eventType')
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('Event type must be between 2 and 120 characters'),
  body('eventDate')
    .isISO8601().withMessage('Event date must be a valid date')
];

const usheringAdminResponseValidation = [
  body('status')
    .isIn(['approved', 'declined']).withMessage('Status must be approved or declined'),
  body('girlsProvided')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Girls provided must be at least 1'),
  body('adminNote')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Admin note cannot exceed 1000 characters')
];

const usheringAdminFulfillValidation = [
  body('adminNote')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Admin note cannot exceed 1000 characters')
];

export {
  validate,
  registerValidation,
  loginValidation,
  onboardingValidation,
  profileUpdateValidation,
  locationUpdateValidation,
  messageValidation,
  emailUpdateValidation,
  emailVerificationValidation,
  kycSubmissionValidation,
  usheringRequestValidation,
  usheringAdminResponseValidation,
  usheringAdminFulfillValidation
};
