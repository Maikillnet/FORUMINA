import { Router } from 'express';
import * as ctrl from '../controllers/trophies.controller.js';
import * as postsAdmin from '../controllers/posts.controller.js';

const router = Router();

router.get('/admin/posts', postsAdmin.listAdminPosts);
router.delete('/admin/posts/:id', postsAdmin.deleteAdminPost);
router.get('/admin/trophies', ctrl.listTrophies);
router.post('/admin/trophies', ctrl.createTrophy);
router.delete('/admin/trophies/:id', ctrl.deleteTrophy);
router.get('/admin/users', ctrl.listUsers);
router.post('/admin/users/:userId/trophies', ctrl.assignTrophy);
router.delete('/admin/users/:userId/trophies/:trophyId', ctrl.revokeTrophy);

export default router;
