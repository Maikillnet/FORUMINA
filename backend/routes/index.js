import { Router } from 'express';
import authRoutes from './auth.routes.js';
import postsRoutes from './posts.routes.js';
import categoriesRoutes from './categories.routes.js';
import searchRoutes from './search.routes.js';
import statsRoutes from './stats.routes.js';
import chatRoutes from './chat.routes.js';
import messagesRoutes from './messages.routes.js';
import usersRoutes from './users.routes.js';
import wallRoutes from './wall.routes.js';
import trophiesRoutes from './trophies.routes.js';
import settingsRoutes from './settings.routes.js';
import emojisRoutes from './emojis.routes.js';
import aiRoutes from './ai.routes.js';

const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/chat', chatRoutes);
router.use('/api/messages', messagesRoutes);
router.use('/api/users', usersRoutes);
router.use('/api/wall', wallRoutes);
router.use('/api/posts', postsRoutes);
router.use('/api/categories', categoriesRoutes);
router.use('/api/search', searchRoutes);
router.use('/api/stats', statsRoutes);
router.use('/api', trophiesRoutes);
router.use('/api', settingsRoutes);
router.use('/api', emojisRoutes);
router.use('/api/ai', aiRoutes);

export default router;
