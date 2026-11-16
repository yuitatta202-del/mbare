import { Router } from 'express';
import { SpifferaController } from '../controllers/spiffera.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'];

// ==========================================
// ROTTE PUBBLICHE
// ==========================================
// Recupera il muro delle spifferate approvate
router.get('/', SpifferaController.getApproved);

// ==========================================
// ROTTE PROTETTE (Utenti loggati)
// ==========================================
// Invia una nuova spifferata
router.post('/', authenticate, SpifferaController.create);

// ==========================================
// ROTTE ADMIN (Moderazione)
// ==========================================
// Recupera le spifferate in attesa
router.get('/admin/pending', authenticate, requireRole(ADMIN_ROLES), SpifferaController.getPending);

// Recupera lo storico (Approvate e Rifiutate)
router.get('/admin/history', authenticate, requireRole(ADMIN_ROLES), SpifferaController.getHistory);

// Approva o Rifiuta una spifferata
router.put('/admin/:id/approve', authenticate, requireRole(ADMIN_ROLES), SpifferaController.approve);
router.put('/admin/:id/reject', authenticate, requireRole(ADMIN_ROLES), SpifferaController.reject);

// Elimina definitivamente una spifferata
router.delete('/admin/:id', authenticate, requireRole(ADMIN_ROLES), SpifferaController.deleteSpiffera);

export default router;