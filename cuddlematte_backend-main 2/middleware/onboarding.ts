import { Request, Response, NextFunction } from 'express';

const requireOnboarding = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  const onboarding = user?.onboarding;

  if (!user?.emailVerified) {
    return res.status(403).json({
      error: 'Email verification required',
      emailVerificationRequired: true
    });
  }

  if (user?.kyc?.status !== 'approved') {
    return res.status(403).json({
      error: 'KYC approval required',
      kycRequired: true,
      kycStatus: user?.kyc?.status || 'not_submitted'
    });
  }

  if (!onboarding || !onboarding.completed) {
    return res.status(403).json({
      error: 'Onboarding required',
      onboardingRequired: true
    });
  }

  next();
};

export default requireOnboarding;
