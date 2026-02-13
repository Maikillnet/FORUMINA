import { Router } from 'express';
import * as ctrl from '../controllers/messages.controller.js';

const router = Router();

router.post('/', ctrl.send);
router.get('/conversations/:userId', ctrl.getConversations);
router.get('/history/:userId/:contactId', ctrl.getHistory);

export default router;
