import { Router } from 'express';
import * as ctrl from '../controllers/emojis.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/emojis', ctrl.getAll);
router.post('/emojis', authMiddleware, ctrl.create);
router.delete('/emojis/:id', authMiddleware, ctrl.remove);

export default router;
