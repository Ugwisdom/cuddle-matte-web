import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Match from '../models/Match';
import Message from '../models/Message';
import { paginate, createPaginationMetadata } from '../utils/helpers';

const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalMatches = await Match.countDocuments({ isActive: true });
    const totalMessages = await Message.countDocuments();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeLastWeek = await User.countDocuments({
      lastActive: { $gte: sevenDaysAgo }
    });

    const genderStats = await User.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          newLast30Days: newUsers,
          activeLast7Days: activeLastWeek
        },
        matches: {
          total: totalMatches
        },
        messages: {
          total: totalMessages
        },
        genderDistribution: genderStats
      }
    });

  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      gender = '',
      isActive = '',
      isBanned = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (gender) {
      filter.gender = gender;
    }

    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    if (isBanned !== '') {
      filter.isBanned = isBanned === 'true';
    }

    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const sort = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 } as any;

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await User.countDocuments(filter);

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const matchCount = await Match.countDocuments({
          users: user._id,
          isActive: true
        });

        const messageCount = await Message.countDocuments({
          sender: user._id
        });

        return {
          ...user,
          matchCount,
          messageCount
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matches = await Match.find({ 
      users: userId, 
      isActive: true 
    })
    .populate('users', 'name photos')
    .limit(10);

    const messageCount = await Message.countDocuments({ sender: userId });
    const matchCount = await Match.countDocuments({ 
      users: userId, 
      isActive: true 
    });

    const likeCount = user.likes?.length || 0;
    const dislikeCount = user.dislikes?.length || 0;

    res.json({
      success: true,
      user: {
        ...user,
        stats: {
          matchCount,
          messageCount,
          likeCount,
          dislikeCount
        },
        recentMatches: matches
      }
    });

  } catch (error) {
    next(error);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    delete updates.role;
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    next(error);
  }
};

const toggleBanUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { reason = 'Violation of terms of service' } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ 
        error: 'Cannot ban admin users' 
      });
    }

    user.isBanned = !user.isBanned;
    
    if (user.isBanned) {
      user.banReason = reason;
      user.bannedAt = new Date();
      user.bannedBy = req.userId as any;
      user.isActive = false;
    } else {
      user.banReason = null;
      user.bannedAt = null;
      user.bannedBy = null;
    }

    await user.save();

    res.json({
      success: true,
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned,
        banReason: user.banReason
      }
    });

  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ 
        error: 'Cannot delete admin users' 
      });
    }

    await Match.deleteMany({ users: userId });

    await Message.deleteMany({ sender: userId });

    await User.updateMany(
      {},
      {
        $pull: {
          likes: userId,
          dislikes: userId,
          matches: userId
        }
      }
    );

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

const getAllMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const matches = await Match.find()
      .populate('users', 'name email photos gender')
      .sort({ matchedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Match.countDocuments();

    res.json({
      success: true,
      matches,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const getAllMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, userId = '' } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const filter = userId ? { sender: userId } : {};

    const messages = await Message.find(filter)
      .populate('sender', 'name email')
      .populate('match')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Message.countDocuments(filter);

    res.json({
      success: true,
      messages,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });

  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }

    const admin = new User({
      email,
      password,
      name,
      role: 'admin',
      emailVerified: true,
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      interestedIn: [],
      isActive: true
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    next(error);
  }
};

const getUserActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const recentLikes = await User.find({ 
      _id: { $in: user.likes.slice(-10) } 
    }).select('name photos');

    const recentMatches = await Match.find({ 
      users: userId 
    })
    .populate('users', 'name photos')
    .sort({ matchedAt: -1 })
    .limit(10);

    const recentMessages = await Message.find({ 
      sender: userId 
    })
    .populate('match')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({
      success: true,
      activity: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          lastActive: user.lastActive
        },
        recentLikes,
        recentMatches,
        recentMessages
      }
    });

  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;

    if (!q || q.length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters' 
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name email photos gender isActive isBanned')
    .limit(20);

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    next(error);
  }
};

const getPendingKyc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pendingUsers = await User.find({ 'kyc.status': 'pending' })
      .select('name email kyc createdAt')
      .sort({ 'kyc.submittedAt': -1 });

    res.json({
      success: true,
      count: pendingUsers.length,
      users: pendingUsers
    });

  } catch (error) {
    next(error);
  }
};

const approveKyc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.kyc?.status !== 'pending') {
      return res.status(400).json({ error: 'KYC is not pending for this user' });
    }

    user.kyc.status = 'approved';
    user.kyc.reviewedAt = new Date();
    user.kyc.reviewedBy = req.userId as any;
    user.kyc.rejectionReason = null;

    await user.save();

    res.json({
      success: true,
      message: 'KYC approved',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        kycStatus: user.kyc.status
      }
    });

  } catch (error) {
    next(error);
  }
};

const rejectKyc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || String(reason).trim().length < 3) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.kyc?.status !== 'pending') {
      return res.status(400).json({ error: 'KYC is not pending for this user' });
    }

    user.kyc.status = 'rejected';
    user.kyc.reviewedAt = new Date();
    user.kyc.reviewedBy = req.userId as any;
    user.kyc.rejectionReason = String(reason).trim();

    await user.save();

    res.json({
      success: true,
      message: 'KYC rejected',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        kycStatus: user.kyc.status,
        rejectionReason: user.kyc.rejectionReason
      }
    });

  } catch (error) {
    next(error);
  }
};

export {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUser,
  toggleBanUser,
  deleteUser,
  getAllMatches,
  getAllMessages,
  deleteMessage,
  createAdmin,
  getUserActivity,
  searchUsers,
  getPendingKyc,
  approveKyc,
  rejectKyc
};
