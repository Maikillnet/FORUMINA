import { Router } from 'express';
import * as posts from '../controllers/posts.controller.js';
import * as comments from '../controllers/comments.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', posts.list);
router.get('/:id', posts.getById);
router.post('/', posts.create);
router.post('/:id/vote', posts.vote);
router.post('/:id/like', posts.like);
router.get('/:id/comments', comments.list);
router.post('/:id/comments', comments.create);
router.post('/:id/comments/:commentId/like', comments.like);

export default router;
