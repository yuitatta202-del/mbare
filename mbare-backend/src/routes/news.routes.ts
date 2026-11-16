import { Router } from 'express';
import { NewsController } from '../controllers/news.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

// ==========================================
// ROTTE ADMIN (Specifiche - Devono venire PRIMA di /:slug)
// ==========================================
router.get('/admin/all', authenticate, requireRole(ADMIN_ROLES), NewsController.getAll);
router.post('/admin/create', authenticate, requireRole(ADMIN_ROLES), NewsController.create);
router.put('/admin/:id', authenticate, requireRole(ADMIN_ROLES), NewsController.update);
router.delete('/admin/:id', authenticate, requireRole(ADMIN_ROLES), NewsController.delete);

// ==========================================
// ROTTE PUBBLICHE (Generiche)
// ==========================================
router.get('/', NewsController.getPublished);
router.get('/:slug', NewsController.getOne);

export default router;