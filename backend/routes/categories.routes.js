import { Router } from 'express';
import * as categories from '../controllers/categories.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();
router.get('/', categories.list);
router.post('/', requireAdmin, categories.create);
router.put('/:id', requireAdmin, categories.update);
router.delete('/:id', requireAdmin, categories.remove);

export default router;
