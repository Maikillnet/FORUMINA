import { Router } from 'express';
import * as ctrl from '../controllers/settings.controller.js';

const router = Router();

router.get('/site-settings', ctrl.getSiteSettings);
router.get('/admin/settings', ctrl.getAll);
router.put('/admin/settings', ctrl.update);
router.post('/admin/recalculate-reputation', ctrl.recalculateReputation);

export default router;
