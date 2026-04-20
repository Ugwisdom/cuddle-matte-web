import { Request, Response, NextFunction } from 'express';
import UsheringRequest from '../models/UsheringRequest';
import Notification from '../models/Notification';
import User from '../models/User';
import { paginate, createPaginationMetadata } from '../utils/helpers';

const createUsheringRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { girlsRequested, location, eventDate, eventType } = req.body;

    const requestedCount = Number(girlsRequested);
    if (!Number.isInteger(requestedCount) || requestedCount < 1) {
      return res.status(400).json({ error: 'Girls requested must be a whole number of at least 1' });
    }

    if (!location || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({ error: 'Event location is required' });
    }

    if (!eventType || typeof eventType !== 'string' || !eventType.trim()) {
      return res.status(400).json({ error: 'Event type is required' });
    }

    const eventDateObj = new Date(eventDate);
    if (!eventDate || Number.isNaN(eventDateObj.getTime())) {
      return res.status(400).json({ error: 'Event date is required and must be valid' });
    }

    if (eventDateObj.getTime() <= Date.now()) {
      return res.status(400).json({ error: 'Event date must be in the future' });
    }

    const request = await UsheringRequest.create({
      requester: req.userId,
      girlsRequested: requestedCount,
      location: location.trim(),
      eventType: eventType.trim(),
      eventDate: eventDateObj
    });

    const requester: any = await User.findById(req.userId).select('name email username photos');
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');

    if (admins.length > 0) {
      const notifications = admins.map(admin => ({
        user: admin._id,
        type: 'ushering_request',
        data: {
          requestId: request._id,
          girlsRequested: request.girlsRequested,
          location: request.location,
          eventType: request.eventType,
          eventDate: request.eventDate,
          requester: requester ? {
            _id: requester._id,
            name: requester.name,
            email: requester.email,
            username: requester.username,
            photos: requester.photos
          } : null
        }
      }));

      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Ushering request submitted',
      request
    });
  } catch (error) {
    next(error);
  }
};

const listMyUsheringRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: limitNum } = paginate(page as any, limit as any);

    const requests = await UsheringRequest.find({ requester: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await UsheringRequest.countDocuments({ requester: req.userId });

    res.json({
      success: true,
      requests,
      pagination: createPaginationMetadata(total, page as any, limit as any)
    });
  } catch (error) {
    next(error);
  }
};

export {
  createUsheringRequest,
  listMyUsheringRequests
};
