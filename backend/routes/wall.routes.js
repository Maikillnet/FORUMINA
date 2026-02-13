import { Router } from 'express';
import * as wall from '../controllers/wall.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);
router.get('/:userId', wall.list);
router.post('/:userId', wall.create);
router.post('/:userId/vote/:postId', wall.votePoll);
router.post('/:userId/like/:postId', wall.likePost);
router.post('/:userId/comment/:postId', wall.addComment);

export default router;
