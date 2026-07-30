import { Router } from 'express';
import * as ctrl from '../controllers/emojis.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/emojis', ctrl.getAll);
router.post('/emojis', requireAdmin, ctrl.create);
router.delete('/emojis/:id', requireAdmin, ctrl.remove);

export default router;
