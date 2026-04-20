import crypto from 'crypto';

const generateVerificationCode = (length = 6): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(crypto.randomInt(min, max));
};

const hashVerificationCode = (code: string): string => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

export {
  generateVerificationCode,
  hashVerificationCode
};
