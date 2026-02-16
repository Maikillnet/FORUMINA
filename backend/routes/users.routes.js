import { Router } from 'express';
import * as users from '../controllers/users.controller.js';
import * as trophies from '../controllers/trophies.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authMiddleware);

router.patch('/me', asyncHandler(users.updateProfile));
router.put('/profile', asyncHandler(users.updateProfile));
router.post('/me/settings', asyncHandler(users.updateSettings));
router.post('/me/password', asyncHandler(users.changePassword));
router.get('/me/feed', users.getActivityFeed);
router.post('/:id/rank', users.setRank);
router.get('/:id/posts', users.getPosts);
router.get('/:id/subscriptions', users.getSubscriptions);
router.get('/:id/followers', users.getFollowers);
router.post('/:id/follow', users.toggleFollow);
router.get('/:id/trophies', trophies.getUserTrophies);
router.get('/:id', users.getById);

export default router;
