import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Match from '../models/Match';
import Connection from '../models/Connection';
import { getPotentialMatches } from '../utils/matchingAlgorithm';
import { formatMatchResponse } from '../utils/helpers';

const discoverMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const potentialMatches = await getPotentialMatches(req.userId);

    res.json({
      success: true,
      count: potentialMatches.length,
      matches: potentialMatches
    });

  } catch (error: any) {
    if (error?.message === 'Please set your location to find matches') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const likeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetUserId } = req.params;

    const targetUser: any = await User.findById(targetUserId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUserId === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot like yourself' });
    }

    const currentUser: any = await User.findById(req.userId);

    if (currentUser.likes.includes(targetUserId)) {
      return res.status(400).json({ error: 'Already liked this user' });
    }

    if (currentUser.matches.includes(targetUserId)) {
      return res.status(400).json({ error: 'Already matched with this user' });
    }

    currentUser.likes.push(targetUserId);

    currentUser.dislikes = currentUser.dislikes.filter(
      id => id.toString() !== targetUserId
    );

    await currentUser.save();

    const isMutualMatch = targetUser.likes.some(
      id => id.toString() === req.userId.toString()
    );

    if (isMutualMatch) {
      const match: any = new Match({
        users: [req.userId, targetUserId]
      });
      await match.save();

      currentUser.matches.push(targetUserId);
      await currentUser.save();

      targetUser.matches.push(req.userId);
      await targetUser.save();

      await Connection.updateOne(
        { requester: req.userId, recipient: targetUserId },
        { $set: { status: 'accepted' } },
        { upsert: true }
      );

      return res.json({
        success: true,
        matched: true,
        message: "It's a match!",
        matchId: match._id,
        user: targetUser.toPublicProfile()
      });
    }

    res.json({
      success: true,
      matched: false,
      message: 'User liked successfully'
    });

  } catch (error) {
    next(error);
  }
};

const dislikeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetUserId } = req.params;

    const targetUser: any = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUserId === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot dislike yourself' });
    }

    const currentUser: any = await User.findById(req.userId);

    if (currentUser.dislikes.includes(targetUserId)) {
      return res.status(400).json({ error: 'Already disliked this user' });
    }

    currentUser.dislikes.push(targetUserId);

    currentUser.likes = currentUser.likes.filter(
      id => id.toString() !== targetUserId
    );

    await currentUser.save();

    res.json({
      success: true,
      message: 'User disliked successfully'
    });

  } catch (error) {
    next(error);
  }
};

const getMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await Match.find({
      users: req.userId,
      isActive: true
    })
    .populate({
      path: 'users',
      select: '-password -email -likes -dislikes -matches'
    })
    .sort({ matchedAt: -1 });

    const formattedMatches = matches.map(match => 
      formatMatchResponse(match, req.userId)
    );

    res.json({
      success: true,
      count: formattedMatches.length,
      matches: formattedMatches
    });

  } catch (error) {
    next(error);
  }
};

const getMatchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = req.params;

    const match: any = await Match.findOne({
      _id: matchId,
      users: req.userId,
      isActive: true
    })
    .populate({
      path: 'users',
      select: '-password -email -likes -dislikes -matches'
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({
      success: true,
      match: formatMatchResponse(match, req.userId)
    });

  } catch (error) {
    next(error);
  }
};

const unmatchUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchUserId } = req.params;

    const match: any = await Match.findOne({
      users: { $all: [req.userId, matchUserId] },
      isActive: true
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    match.isActive = false;
    await match.save();

    await User.findByIdAndUpdate(req.userId, {
      $pull: { matches: matchUserId }
    });

    await User.findByIdAndUpdate(matchUserId, {
      $pull: { matches: req.userId }
    });

    res.json({
      success: true,
      message: 'Unmatched successfully'
    });

  } catch (error) {
    next(error);
  }
};

const undoSwipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser: any = await User.findById(req.userId);

    const lastLiked = currentUser.likes[currentUser.likes.length - 1];
    const lastDisliked = currentUser.dislikes[currentUser.dislikes.length - 1];

    let undoneUserId = null;
    let action = null;

    if (lastLiked) {
      currentUser.likes.pop();
      undoneUserId = lastLiked;
      action = 'like';
    } else if (lastDisliked) {
      currentUser.dislikes.pop();
      undoneUserId = lastDisliked;
      action = 'dislike';
    } else {
      return res.status(400).json({ 
        error: 'No action to undo' 
      });
    }

    await currentUser.save();

    res.json({
      success: true,
      message: `Undid last ${action}`,
      undoneUserId
    });

  } catch (error) {
    next(error);
  }
};

export {
  discoverMatches,
  likeUser,
  dislikeUser,
  getMatches,
  getMatchById,
  unmatchUser,
  undoSwipe
};
