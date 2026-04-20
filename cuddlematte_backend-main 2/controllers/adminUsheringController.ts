import { Request, Response, NextFunction } from 'express';
import UsheringRequest from '../models/UsheringRequest';
import Notification from '../models/Notification';
import User from '../models/User';
import { paginate, createPaginationMetadata } from '../utils/helpers';

const adminListUsheringRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status = '', requesterId = '' } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (requesterId) {
      filter.requester = requesterId;
    }

    const requests = await UsheringRequest.find(filter)
      .populate('requester', 'name email username')
      .populate('admin', 'name email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await UsheringRequest.countDocuments(filter);

    res.json({
      success: true,
      requests,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });
  } catch (error) {
    next(error);
  }
};

const adminRespondUsheringRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId } = req.params;
    const { status, girlsProvided, adminNote } = req.body;

    if (!['approved', 'declined'].includes(String(status))) {
      return res.status(400).json({ error: 'Status must be approved or declined' });
    }

    const request: any = await UsheringRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Ushering request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Ushering request already processed' });
    }

    if (status === 'approved') {
      const providedCount = Number(girlsProvided);
      if (!Number.isInteger(providedCount) || providedCount < 1) {
        return res.status(400).json({ error: 'Girls provided must be a whole number of at least 1' });
      }
      if (providedCount > request.girlsRequested) {
        return res.status(400).json({ error: 'Girls provided cannot exceed girls requested' });
      }
      request.girlsProvided = providedCount;
    } else {
      request.girlsProvided = null;
    }

    request.status = status;
    request.admin = req.userId;
    request.adminNote = adminNote ? String(adminNote).trim() : null;
    request.respondedAt = new Date();
    request.fulfilledAt = null;

    await request.save();

    const adminUser: any = await User.findById(req.userId).select('name email username');

    await Notification.create({
      user: request.requester,
      type: 'ushering_response',
      data: {
        requestId: request._id,
        status: request.status,
        girlsProvided: request.girlsProvided,
        adminNote: request.adminNote,
        admin: adminUser ? {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          username: adminUser.username
        } : null
      }
    });

    res.json({
      success: true,
      message: 'Ushering request updated',
      request
    });
  } catch (error) {
    next(error);
  }
};

const adminFulfillUsheringRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId } = req.params;
    const { adminNote } = req.body;

    const request: any = await UsheringRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Ushering request not found' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved requests can be fulfilled' });
    }

    request.status = 'fulfilled';
    request.fulfilledAt = new Date();
    request.admin = req.userId;
    request.adminNote = adminNote ? String(adminNote).trim() : request.adminNote;

    await request.save();

    const adminUser: any = await User.findById(req.userId).select('name email username');

    await Notification.create({
      user: request.requester,
      type: 'ushering_fulfilled',
      data: {
        requestId: request._id,
        status: request.status,
        girlsProvided: request.girlsProvided,
        adminNote: request.adminNote,
        admin: adminUser ? {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          username: adminUser.username
        } : null
      }
    });

    res.json({
      success: true,
      message: 'Ushering request fulfilled',
      request
    });
  } catch (error) {
    next(error);
  }
};

export {
  adminListUsheringRequests,
  adminRespondUsheringRequest,
  adminFulfillUsheringRequest
};
