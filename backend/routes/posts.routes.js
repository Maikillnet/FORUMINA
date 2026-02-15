import { Router } from 'express';
import * as posts from '../controllers/posts.controller.js';
import * as comments from '../controllers/comments.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', posts.list);
router.get('/:id/similar', posts.getSimilar);
router.post('/:id/hit', posts.hit);
router.get('/:id', posts.getById);
router.post('/', posts.create);
router.put('/:id', posts.update);
router.delete('/:id', posts.deletePost);
router.post('/:id/vote', posts.vote);
router.post('/:id/like', posts.like);
router.get('/:id/comments', comments.list);
router.post('/:id/comments', comments.create);
router.put('/:id/comments/:commentId', comments.update);
router.delete('/:id/comments/:commentId', comments.remove);
router.post('/:id/comments/:commentId/like', comments.like);

export default router;
