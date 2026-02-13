import { Router } from 'express';
import * as stats from '../controllers/stats.controller.js';

const router = Router();
router.get('/', stats.get);
router.get('/latest-comments', stats.getLatestComments);
export default router;
