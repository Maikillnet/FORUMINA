import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', auth.me);

export default router;
