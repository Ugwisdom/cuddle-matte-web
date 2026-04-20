import { Router } from 'express';
import auth from '../middleware/auth';
import requireOnboarding from '../middleware/onboarding';
import {
  discoverMatches,
  likeUser,
  dislikeUser,
  getMatches,
  getMatchById,
  unmatchUser,
  undoSwipe
} from '../controllers/matchController';

const router = Router();

router.get('/discover', auth, requireOnboarding, discoverMatches);
router.post('/like/:targetUserId', auth, requireOnboarding, likeUser);
router.post('/dislike/:targetUserId', auth, requireOnboarding, dislikeUser);
router.post('/undo', auth, requireOnboarding, undoSwipe);
router.get('/', auth, requireOnboarding, getMatches);
router.get('/:matchId', auth, requireOnboarding, getMatchById);
router.delete('/:matchUserId', auth, requireOnboarding, unmatchUser);

export default router;
