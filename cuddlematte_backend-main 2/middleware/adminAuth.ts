import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    req.admin = user;
    next();

  } catch (error) {
    res.status(500).json({ 
      error: 'Admin authentication failed' 
    });
  }
};

export default adminAuth;
