import { Router } from 'express';
import * as ctrl from '../controllers/trophies.controller.js';
import * as postsAdmin from '../controllers/posts.controller.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/admin/posts', requireAdmin, postsAdmin.listAdminPosts);
router.delete('/admin/posts/:id', requireAdmin, postsAdmin.deleteAdminPost);
router.get('/admin/trophies', requireAdmin, ctrl.listTrophies);
router.post('/admin/trophies', requireAdmin, ctrl.createTrophy);
router.delete('/admin/trophies/:id', requireAdmin, ctrl.deleteTrophy);
router.get('/admin/users', requireAdmin, ctrl.listUsers);
router.post('/admin/users/:userId/trophies', requireAdmin, ctrl.assignTrophy);
router.delete('/admin/users/:userId/trophies/:trophyId', requireAdmin, ctrl.revokeTrophy);

export default router;
