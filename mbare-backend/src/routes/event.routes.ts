import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js'; // <-- Aggiunto requireRole

const router = Router();
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

// Rotte pubbliche
router.get('/', EventController.getAll);

// Rotte protette (utenti loggati)
router.post('/', authenticate, EventController.create);

// Rotte Admin (moderazione)
router.get('/admin/pending', authenticate, requireRole(ADMIN_ROLES), EventController.getPending);
router.put('/admin/:id/approve', authenticate, requireRole(ADMIN_ROLES), EventController.approve);

export default router;