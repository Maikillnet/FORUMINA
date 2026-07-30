import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authMiddleware);

router.post('/register', authRateLimit, asyncHandler(auth.register));
router.post('/login', authRateLimit, asyncHandler(auth.login));
router.get('/me', auth.me);

export default router;
