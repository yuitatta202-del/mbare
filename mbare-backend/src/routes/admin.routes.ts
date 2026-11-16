import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { SpifferaController } from '../controllers/spiffera.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const SUPER_ADMIN_ONLY = ['SUPER_ADMIN'];
const CONTENT_MODERATORS = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR']; 

// ==========================================
// GESTIONE UTENTI (Solo Super Admin)
// ==========================================
router.get('/users', authenticate, requireRole(SUPER_ADMIN_ONLY), AdminController.getUsers);
router.put('/users/:id/role', authenticate, requireRole(SUPER_ADMIN_ONLY), AdminController.updateRole);
router.put('/users/:id/active', authenticate, requireRole(SUPER_ADMIN_ONLY), AdminController.toggleActive);

// ==========================================
// STATISTICHE & ANALYTICS (Solo Super Admin)
// ==========================================
router.get('/stats', authenticate, requireRole(SUPER_ADMIN_ONLY), AdminController.getStats);

// FIX: Aggiunta la rotta per i grafici della dashboard
router.get('/analytics', authenticate, requireRole(SUPER_ADMIN_ONLY), AdminController.getAnalytics);

// ==========================================
// GESTIONE CONTENUTI (Admin, Super Admin e Moderatori)
// ==========================================

// NEWS
router.get('/news', authenticate, requireRole(CONTENT_MODERATORS), AdminController.getAllNews);
router.post('/news', authenticate, requireRole(CONTENT_MODERATORS), AdminController.createNews);
router.put('/news/:id', authenticate, requireRole(CONTENT_MODERATORS), AdminController.updateNews);
router.delete('/news/:id', authenticate, requireRole(CONTENT_MODERATORS), AdminController.deleteNews);

// SPIFFERA
router.get('/confessions/pending', authenticate, requireRole(CONTENT_MODERATORS), SpifferaController.getPending);
router.get('/confessions/history', authenticate, requireRole(CONTENT_MODERATORS), SpifferaController.getHistory);
router.put('/confessions/:id/approve', authenticate, requireRole(CONTENT_MODERATORS), SpifferaController.approve);
router.put('/confessions/:id/reject', authenticate, requireRole(CONTENT_MODERATORS), SpifferaController.reject);
router.delete('/confessions/:id', authenticate, requireRole(CONTENT_MODERATORS), SpifferaController.deleteSpiffera);

// EVENTI
router.get('/events', authenticate, requireRole(CONTENT_MODERATORS), AdminController.getAllEvents);
router.put('/events/:id/approve', authenticate, requireRole(CONTENT_MODERATORS), AdminController.approveEvent);
router.delete('/events/:id', authenticate, requireRole(CONTENT_MODERATORS), AdminController.deleteEvent);

// GRUPPI
router.get('/groups', authenticate, requireRole(CONTENT_MODERATORS), AdminController.getAllGroups);
router.delete('/groups/:id', authenticate, requireRole(CONTENT_MODERATORS), AdminController.deleteGroup);

// SEGNALAZIONI
router.get('/reports', authenticate, requireRole(CONTENT_MODERATORS), AdminController.getAllReports);
router.put('/reports/:id/resolve', authenticate, requireRole(CONTENT_MODERATORS), AdminController.resolveReport);
router.put('/reports/:id/dismiss', authenticate, requireRole(CONTENT_MODERATORS), AdminController.dismissReport);

// ==========================================
// GESTIONE ANNUNCI (Bacheca) - (Solo Super Admin)
// ==========================================
router.get('/board', authenticate, requireRole(SUPER_ADMIN_ONLY), AdminController.getAllBoardPosts);
router.delete('/board/:id', authenticate, requireRole(SUPER_ADMIN_ONLY), AdminController.deleteBoardPost);

// ==========================================
// MBARE COIN (Solo Super Admin)
// ==========================================
router.get('/coins', authenticate, requireRole(SUPER_ADMIN_ONLY), AdminController.getCoinDashboard);
router.post('/coins/adjust', authenticate, requireRole(SUPER_ADMIN_ONLY), AdminController.adjustTokens);
router.post('/coins/broadcast', authenticate, requireRole(SUPER_ADMIN_ONLY), AdminController.broadcastNotification);


export default router;