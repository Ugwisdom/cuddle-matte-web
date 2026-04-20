import { Request, Response, NextFunction } from 'express';
import Connection from '../models/Connection';
import User from '../models/User';
import Match from '../models/Match';
import Notification from '../models/Notification';

const requestConnect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetUserId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (targetUserId === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }

    const targetUser: any = await User.findById(targetUserId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existing: any = await Connection.findOne({
      $or: [
        { requester: req.userId, recipient: targetUserId },
        { requester: targetUserId, recipient: req.userId }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ error: 'Connection already exists' });
      }

      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Connection request already pending' });
      }

      if (existing.status === 'declined') {
        existing.requester = req.userId;
        existing.recipient = targetUserId;
        existing.status = 'pending';
        await existing.save();

        const requester: any = await User.findById(req.userId).select('name email username photos');

        await Notification.create({
          user: targetUserId,
          type: 'connect_request',
          data: {
            connectionId: existing._id,
            requesterId: req.userId,
            requester: requester ? {
              _id: requester._id,
              name: requester.name,
              email: requester.email,
              username: requester.username,
              photos: requester.photos
            } : null
          }
        });

        return res.status(201).json({
          success: true,
          message: 'Connection request sent',
          connection: existing
        });
      }
    }

    const connection = await Connection.create({
      requester: req.userId,
      recipient: targetUserId,
      status: 'pending'
    });

    const requester: any = await User.findById(req.userId).select('name email username photos');

    await Notification.create({
      user: targetUserId,
      type: 'connect_request',
      data: {
        connectionId: connection._id,
        requesterId: req.userId,
        requester: requester ? {
          _id: requester._id,
          name: requester.name,
          email: requester.email,
          username: requester.username,
          photos: requester.photos
        } : null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Connection request sent',
      connection
    });

  } catch (error) {
    next(error);
  }
};

const acceptConnect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId } = req.params;

    const connection: any = await Connection.findOne({
      _id: requestId,
      recipient: req.userId,
      status: 'pending'
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    connection.status = 'accepted';
    await connection.save();

    const requesterId = connection.requester.toString();
    const recipientId = connection.recipient.toString();

    let match = await Match.findOne({
      users: { $all: [requesterId, recipientId] },
      isActive: true
    });

    if (!match) {
      match = await Match.create({ users: [requesterId, recipientId] });

      await User.findByIdAndUpdate(requesterId, {
        $addToSet: { matches: recipientId }
      });

      await User.findByIdAndUpdate(recipientId, {
        $addToSet: { matches: requesterId }
      });
    }

    const recipient: any = await User.findById(recipientId).select('name email username photos');

    await Notification.create({
      user: requesterId,
      type: 'connect_accepted',
      data: {
        connectionId: connection._id,
        matchId: match._id,
        recipient: recipient ? {
          _id: recipient._id,
          name: recipient.name,
          email: recipient.email,
          username: recipient.username,
          photos: recipient.photos
        } : null
      }
    });

    res.json({
      success: true,
      message: 'Connection accepted',
      connection,
      matchId: match._id
    });

  } catch (error) {
    next(error);
  }
};

const declineConnect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId } = req.params;

    const connection: any = await Connection.findOne({
      _id: requestId,
      recipient: req.userId,
      status: 'pending'
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    connection.status = 'declined';
    await connection.save();

    const recipient: any = await User.findById(connection.recipient).select('name email username photos');

    await Notification.create({
      user: connection.requester,
      type: 'connect_declined',
      data: {
        connectionId: connection._id,
        recipient: recipient ? {
          _id: recipient._id,
          name: recipient.name,
          email: recipient.email,
          username: recipient.username,
          photos: recipient.photos
        } : null
      }
    });

    res.json({
      success: true,
      message: 'Connection declined'
    });

  } catch (error) {
    next(error);
  }
};

const listConnections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.userId },
        { recipient: req.userId }
      ]
    })
    .populate('requester', 'name username photos')
    .populate('recipient', 'name username photos')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: connections.length,
      connections
    });

  } catch (error) {
    next(error);
  }
};

export {
  requestConnect,
  acceptConnect,
  declineConnect,
  listConnections
};
