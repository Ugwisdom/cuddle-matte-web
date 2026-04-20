const sendEmailVerificationCode = async (toEmail: string, code: string): Promise<void> => {
  console.warn('Email sending is disabled. Returning verification code only for dev/test.');
  console.log(`Email verification code for ${toEmail}: ${code}`);
};

export {
  sendEmailVerificationCode
};
