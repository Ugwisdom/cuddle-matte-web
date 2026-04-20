import jwt, { SignOptions } from 'jsonwebtoken';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRE || '30d') as SignOptions['expiresIn'] };

  return jwt.sign(
    { userId },
    secret,
    options
  );
};

const formatUserResponse = (user: any) => {
  const userObject = user.toObject ? user.toObject() : user;
  
  delete userObject.password;
  delete userObject.__v;
  delete userObject.emailVerification;
  delete userObject.kyc;
  
  return userObject;
};

const formatMatchResponse = (match: any, currentUserId: string) => {
  const matchObject = match.toObject ? match.toObject() : match;
  
  const otherUser = matchObject.users.find(
    user => user._id.toString() !== currentUserId.toString()
  );
  
  return {
    matchId: matchObject._id,
    matchedAt: matchObject.matchedAt,
    lastMessageAt: matchObject.lastMessageAt,
    user: otherUser ? formatUserResponse(otherUser) : null
  };
};

const paginate = (page: number | string = 1, limit: number | string = 20) => {
  const pageNum = parseInt(String(page), 10);
  const limitNum = parseInt(String(limit), 10);
  
  return {
    skip: (pageNum - 1) * limitNum,
    limit: limitNum
  };
};

const createPaginationMetadata = (total: number, page: number | string, limit: number | string) => {
  const pageNum = parseInt(String(page), 10);
  const limitNum = parseInt(String(limit), 10);
  const totalPages = Math.ceil(total / limitNum);
  
  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1
  };
};

const sanitizeObject = (obj: Record<string, any>) => {
  const sanitized: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
};

const generateRandomString = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

const getRelativeTime = (date: string | Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export {
  generateToken,
  formatUserResponse,
  formatMatchResponse,
  paginate,
  createPaginationMetadata,
  sanitizeObject,
  generateRandomString,
  getRelativeTime
};
