import { Router } from 'express';
import * as ctrl from '../controllers/settings.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/site-settings', ctrl.getSiteSettings);
router.get('/admin/settings', requireAdmin, ctrl.getAll);
router.put('/admin/settings', requireAdmin, ctrl.update);
router.post('/admin/recalculate-reputation', requireAdmin, ctrl.recalculateReputation);

export default router;
