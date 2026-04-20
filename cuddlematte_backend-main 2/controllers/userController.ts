import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { formatUserResponse } from '../utils/helpers';
import { sendEmailVerificationCode } from '../utils/email';
import { generateVerificationCode, hashVerificationCode } from '../utils/verification';
import { uploadBuffer } from '../utils/cloudinary';

const setEmailVerification = (user: any) => {
  const code = generateVerificationCode(6);
  user.emailVerification = {
    codeHash: hashVerificationCode(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    lastSentAt: new Date()
  };
  user.emailVerified = false;
  return code;
};

const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: any = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: formatUserResponse(user),
      kycStatus: user.kyc?.status || 'not_submitted'
    });

  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;

    delete updates.password;
    delete updates.email;
    delete updates.likes;
    delete updates.dislikes;
    delete updates.matches;
    delete updates.isActive;
    delete updates.onboarding;
    delete updates.dateOfBirth;
    delete updates.emailVerified;
    delete updates.emailVerification;
    delete updates.role;
    delete updates.kyc;

    const user: any = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: formatUserResponse(user),
      kycStatus: user.kyc?.status || 'not_submitted'
    });

  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { longitude, latitude } = req.body;

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid longitude' });
    }
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ error: 'Invalid latitude' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: user.location
    });

  } catch (error) {
    next(error);
  }
};

const addPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { photoUrl } = req.body;
    const file = (req as any).file;

    const user: any = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.photos.length >= 6) {
      return res.status(400).json({ 
        error: 'Maximum 6 photos allowed' 
      });
    }

    let resolvedUrl = photoUrl;

    if (file) {
      const uploaded = await uploadBuffer(file.buffer, { folder: 'users/photos', resource_type: 'image' });
      resolvedUrl = uploaded.secure_url;
    }

    if (!resolvedUrl) {
      return res.status(400).json({ error: 'Photo file or photo URL is required' });
    }

    user.photos.push(resolvedUrl);
    await user.save();

    res.json({
      success: true,
      message: 'Photo added successfully',
      photos: user.photos
    });

  } catch (error) {
    next(error);
  }
};

const deletePhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { index } = req.params;
    const photoIndex = parseInt(index, 10);

    const user: any = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (photoIndex < 0 || photoIndex >= user.photos.length) {
      return res.status(400).json({ error: 'Invalid photo index' });
    }

    user.photos.splice(photoIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      photos: user.photos
    });

  } catch (error) {
    next(error);
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user: any = await User.findById(userId)
      .select('-password -email -likes -dislikes -matches');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user.toPublicProfile()
    });

  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ageRange, maxDistance } = req.body;

    const updateData = {};

    if (ageRange) {
      if (ageRange.min < 18 || ageRange.min > 100) {
        return res.status(400).json({ 
          error: 'Minimum age must be between 18 and 100' 
        });
      }
      if (ageRange.max < 18 || ageRange.max > 100) {
        return res.status(400).json({ 
          error: 'Maximum age must be between 18 and 100' 
        });
      }
      if (ageRange.min > ageRange.max) {
        return res.status(400).json({ 
          error: 'Minimum age cannot be greater than maximum age' 
        });
      }
      updateData['preferences.ageRange'] = ageRange;
    }

    if (maxDistance !== undefined) {
      if (maxDistance < 1 || maxDistance > 500) {
        return res.status(400).json({ 
          error: 'Maximum distance must be between 1 and 500 km' 
        });
      }
      updateData['preferences.maxDistance'] = maxDistance;
    }

    const user: any = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    next(error);
  }
};

const updateEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user: any = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    if (user.email.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({ error: 'Email is unchanged' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    user.email = email;
    const verificationCode = setEmailVerification(user);
    await user.save();
    await sendEmailVerificationCode(user.email, verificationCode);

    const responsePayload: any = {
      success: true,
      message: 'Email updated. Please verify your new email address.'
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.emailVerificationCode = verificationCode;
    }

    res.json(responsePayload);

  } catch (error) {
    next(error);
  }
};

const submitKyc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { licenseFrontUrl, licenseBackUrl } = req.body;
    const files = (req as any).files || {};
    const licenseFrontFile = files.licenseFront?.[0];
    const licenseBackFile = files.licenseBack?.[0];

    const user: any = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Email verification required',
        emailVerificationRequired: true
      });
    }

    if (user.kyc?.status === 'approved') {
      return res.status(400).json({ error: 'KYC already approved' });
    }

    if (user.kyc?.status === 'pending') {
      return res.status(400).json({ error: 'KYC submission is already pending' });
    }

    let resolvedFrontUrl = licenseFrontUrl;
    let resolvedBackUrl = licenseBackUrl;

    if (licenseFrontFile) {
      const uploadedFront = await uploadBuffer(licenseFrontFile.buffer, { folder: 'users/kyc', resource_type: 'image' });
      resolvedFrontUrl = uploadedFront.secure_url;
    }

    if (licenseBackFile) {
      const uploadedBack = await uploadBuffer(licenseBackFile.buffer, { folder: 'users/kyc', resource_type: 'image' });
      resolvedBackUrl = uploadedBack.secure_url;
    }

    if (!resolvedFrontUrl || !resolvedBackUrl) {
      return res.status(400).json({ error: 'License front and back are required' });
    }

    user.kyc = {
      status: 'pending',
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      documents: {
        licenseFrontUrl: resolvedFrontUrl,
        licenseBackUrl: resolvedBackUrl
      }
    };

    await user.save();

    res.json({
      success: true,
      message: 'KYC submitted successfully',
      kycStatus: user.kyc.status
    });

  } catch (error) {
    next(error);
  }
};

export {
  getMyProfile,
  updateMyProfile,
  updateLocation,
  addPhoto,
  deletePhoto,
  getUserById,
  updatePreferences,
  updateEmail,
  submitKyc
};
