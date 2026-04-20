import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateToken, formatUserResponse } from '../utils/helpers';
import { sendEmailVerificationCode } from '../utils/email';
import { generateVerificationCode, hashVerificationCode } from '../utils/verification';

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

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, username, dateOfBirth, gender, interestedIn, city } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }

    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    if (age < 18) {
      return res.status(400).json({ 
        error: 'You must be at least 18 years old to register' 
      });
    }

    const user = new User({
      email,
      password,
      name,
      username,
      dateOfBirth,
      gender,
      interestedIn: interestedIn || [gender === 'male' ? 'female' : 'male'],
      city
    });

    const verificationCode = setEmailVerification(user);
    await user.save();
    await sendEmailVerificationCode(user.email, verificationCode);

    const responsePayload: any = {
      success: true,
      message: 'Verification code sent'
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.emailVerificationCode = verificationCode;
    }

    res.status(201).json(responsePayload);

  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user: any = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated. Please contact support.' 
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Email verification required',
        emailVerificationRequired: true
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id.toString());

    const userResponse = formatUserResponse(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
      onboardingRequired: !user.onboarding || !user.onboarding.completed,
      emailVerificationRequired: !user.emailVerified,
      kycRequired: user.kyc?.status !== 'approved',
      kycStatus: user.kyc?.status || 'not_submitted'
    });

  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: formatUserResponse(user),
      kycStatus: (user as any).kyc?.status || 'not_submitted'
    });

  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await User.findByIdAndUpdate(req.userId, { 
      lastActive: new Date() 
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    next(error);
  }
};

const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user: any = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    next(error);
  }
};

const requestEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!req.userId && !email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user: any = req.userId
      ? await User.findById(req.userId)
      : await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const verificationCode = setEmailVerification(user);
    await user.save();
    await sendEmailVerificationCode(user.email, verificationCode);

    const responsePayload: any = {
      success: true,
      message: 'Verification code sent'
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.emailVerificationCode = verificationCode;
    }

    res.json(responsePayload);

  } catch (error) {
    next(error);
  }
};

const verifyEmailCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, email } = req.body;

    const user: any = req.userId
      ? await User.findById(req.userId)
      : await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.emailVerification || !user.emailVerification.codeHash) {
      return res.status(400).json({ error: 'No verification code requested' });
    }

    if (user.emailVerification.expiresAt && user.emailVerification.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    const codeHash = hashVerificationCode(code);
    if (codeHash !== user.emailVerification.codeHash) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    user.emailVerified = true;
    user.emailVerification = {
      codeHash: null,
      expiresAt: null,
      lastSentAt: user.emailVerification.lastSentAt
    };

    await user.save();

    const token = generateToken(user._id.toString());
    const userResponse = formatUserResponse(user);

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: userResponse,
      onboardingRequired: !user.onboarding || !user.onboarding.completed,
      emailVerificationRequired: !user.emailVerified,
      kycRequired: user.kyc?.status !== 'approved',
      kycStatus: user.kyc?.status || 'not_submitted'
    });

  } catch (error) {
    next(error);
  }
};

const deactivateAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;

    const user: any = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    next(error);
  }
};

const completeOnboarding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dateOfBirth, city } = req.body;

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

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return res.status(400).json({
        error: 'You must be at least 18 years old to complete onboarding'
      });
    }

    user.dateOfBirth = birthDate;
    user.city = city;
    user.onboarding = {
      completed: true,
      completedAt: new Date(),
      ageVerified: true,
      cityVerified: true
    };

    await user.save();

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: formatUserResponse(user)
    });

  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
  deactivateAccount,
  completeOnboarding,
  requestEmailVerification,
  verifyEmailCode
};
