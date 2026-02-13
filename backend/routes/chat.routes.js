import { Router } from 'express';
import * as chat from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.get('/', chat.list);
router.post('/', chat.create);

export default router;
