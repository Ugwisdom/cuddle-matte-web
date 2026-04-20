import { Request, Response, NextFunction } from 'express';
import Message from '../models/Message';
import Match from '../models/Match';
import User from '../models/User';
import Notification from '../models/Notification';

const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recipientId, content } = req.body;

    const currentUser: any = await User.findById(req.userId);
    
    if (!currentUser.matches.includes(recipientId)) {
      return res.status(403).json({ 
        error: 'You can only message users you have matched with' 
      });
    }

    const match: any = await Match.findOne({
      users: { $all: [req.userId, recipientId] },
      isActive: true
    });

    if (!match) {
      return res.status(404).json({ 
        error: 'Match not found or has been deactivated' 
      });
    }

    const message = new Message({
      match: match._id,
      sender: req.userId,
      content: content.trim()
    });

    await message.save();

    match.lastMessageAt = new Date();
    await match.save();

    await message.populate('sender', 'name photos');

    const sender: any = await User.findById(req.userId).select('name email username photos');

    await Notification.create({
      user: recipientId,
      type: 'message',
      data: {
        matchId: match._id,
        senderId: req.userId,
        sender: sender ? {
          _id: sender._id,
          name: sender.name,
          email: sender.email,
          username: sender.username,
          photos: sender.photos
        } : null,
        preview: content.trim().slice(0, 120)
      }
    });

    res.status(201).json({
      success: true,
      message: message
    });

  } catch (error) {
    next(error);
  }
};

const getConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const match: any = await Match.findOne({
      users: { $all: [req.userId, matchUserId] },
      isActive: true
    });

    if (!match) {
      return res.status(404).json({ 
        error: 'Match not found or has been deactivated' 
      });
    }

    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
    
    const messages = await Message.find({ 
      match: match._id,
      deleted: false
    })
    .populate('sender', 'name photos')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit as string, 10));

    const total = await Message.countDocuments({ 
      match: match._id,
      deleted: false
    });

    messages.reverse();

    res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        total,
        pages: Math.ceil(total / parseInt(limit as string, 10))
      }
    });

  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchUserId } = req.params;

    const match: any = await Match.findOne({
      users: { $all: [req.userId, matchUserId] }
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const result = await Message.updateMany(
      {
        match: match._id,
        sender: matchUserId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    next(error);
  }
};

const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await Match.find({
      users: req.userId,
      isActive: true
    })
    .populate({
      path: 'users',
      select: 'name photos lastActive'
    })
    .sort({ lastMessageAt: -1 });

    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUser: any = match.users.find(
          user => user._id.toString() !== req.userId.toString()
        );

        const lastMessage: any = await Message.findOne({ 
          match: match._id,
          deleted: false
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'name');

        const unreadCount = await Message.countDocuments({
          match: match._id,
          sender: otherUser._id,
          read: false,
          deleted: false
        });

        return {
          matchId: match._id,
          user: {
            _id: otherUser._id,
            name: otherUser.name,
            photos: otherUser.photos,
            lastActive: otherUser.lastActive
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            sender: lastMessage.sender._id,
            senderName: lastMessage.sender.name,
            createdAt: lastMessage.createdAt,
            read: lastMessage.read
          } : null,
          unreadCount,
          matchedAt: match.matchedAt,
          lastMessageAt: match.lastMessageAt
        };
      })
    );

    res.json({
      success: true,
      count: conversations.length,
      conversations
    });

  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'You can only delete your own messages' 
      });
    }

    message.deleted = true;
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await Match.find({
      users: req.userId,
      isActive: true
    }).select('_id');

    const matchIds = matches.map(m => m._id);

    const unreadCount = await Message.countDocuments({
      match: { $in: matchIds },
      sender: { $ne: req.userId },
      read: false,
      deleted: false
    });

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    next(error);
  }
};

export {
  sendMessage,
  getConversation,
  markAsRead,
  getConversations,
  deleteMessage,
  getUnreadCount
};
