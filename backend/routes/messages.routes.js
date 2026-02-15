import { Router } from 'express';
import * as ctrl from '../controllers/messages.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.post('/', ctrl.send);
router.post('/:id/pin', ctrl.togglePinMessage);
router.post('/:id/unpin', ctrl.unpinMessage);
router.delete('/:id', ctrl.deleteMessage);
router.get('/conversations/:userId', ctrl.getConversations);
router.get('/history/:userId/:contactId', ctrl.getHistory);
router.get('/attachments/:userId/:contactId', ctrl.getAttachments);

export default router;
