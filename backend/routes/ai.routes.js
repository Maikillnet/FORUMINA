import { Router } from 'express';
import * as ctrl from '../controllers/ai.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.post('/suggest', ctrl.suggest);

export default router;
