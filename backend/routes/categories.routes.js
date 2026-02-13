import { Router } from 'express';
import * as categories from '../controllers/categories.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.get('/', categories.list);
router.post('/', authMiddleware, categories.create);
router.put('/:id', authMiddleware, categories.update);
router.delete('/:id', authMiddleware, categories.remove);

export default router;
