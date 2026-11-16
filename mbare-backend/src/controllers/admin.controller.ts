import type { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import type { AuthRequest } from '../middleware/auth.js';

export class AdminController {
  // ==========================================
  // 1. GESTIONE UTENTI
  // ==========================================
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try { 
      res.json(await AdminService.getAllUsers()); 
    } catch (error) { next(error); }
  }

  static async updateRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      const currentUserId = req.user?.sub || req.user?.id;
      if (req.user?.user_role === 'ADMIN' && id === currentUserId) {
        return res.status(403).json({ error: 'Non puoi cambiare il tuo stesso ruolo' });
      }

      res.json({ message: 'Ruolo aggiornato', data: await AdminService.updateUserRole(id, role) });
    } catch (error) { next(error); }
  }

  static async toggleActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const currentUserId = req.user?.sub || req.user?.id;
      if (req.user?.user_role === 'ADMIN' && id === currentUserId) {
        return res.status(403).json({ error: 'Non puoi bannare te stesso' });
      }

      res.json({ message: 'Stato aggiornato', data: await AdminService.toggleUserActive(id, isActive) });
    } catch (error) { next(error); }
  }

  // ==========================================
  // 2. STATISTICHE BASE
  // ==========================================
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try { 
      res.json(await AdminService.getStats()); 
    } catch (error) { next(error); }
  }

  // ==========================================
  // 3. ANALYTICS (DASHBOARD 360)
  // ==========================================
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try { 
      res.json(await AdminService.getAnalytics()); 
    } catch (error) { next(error); }
  }

  // ==========================================
  // 4. GESTIONE NEWS
  // ==========================================
  static async getAllNews(req: Request, res: Response, next: NextFunction) {
    try { 
      res.json(await AdminService.getAllNews()); 
    } catch (error) { next(error); }
  }

  static async createNews(req: AuthRequest, res: Response, next: NextFunction) {
    try { 
      const authorId = req.user?.sub || req.user?.id;
      if (!authorId) throw new Error('Utente non identificato');

      res.status(201).json({ message: 'News creata', data: await AdminService.createNews(req.body, authorId) }); 
    } catch (error) { next(error); }
  }

  static async updateNews(req: AuthRequest, res: Response, next: NextFunction) {
    try { 
      const rawId = req.params.id;
      let id: bigint;
      
      try {
        id = BigInt(rawId);
      } catch (e) {
        return res.status(400).json({ error: 'ID news non valido, minchia!' });
      }

      const updated = await AdminService.updateNews(id, req.body);
      res.json({ message: 'News aggiornata', data: updated }); 
    } catch (error) { next(error); }
  }

  static async deleteNews(req: Request, res: Response, next: NextFunction) {
    try { 
      const rawId = req.params.id;
      let id: bigint;
      
      try {
        id = BigInt(rawId);
      } catch (e) {
        return res.status(400).json({ error: 'ID news non valido, minchia!' });
      }

      await AdminService.deleteNews(id); 
      res.json({ message: 'News eliminata' }); 
    } catch (error) { next(error); }
  }

  // ==========================================
  // 5. GESTIONE SPIFFERA
  // ==========================================
  static async getPendingSpiffera(req: Request, res: Response, next: NextFunction) {
    try { 
      res.json(await AdminService.getPendingConfessions()); 
    } catch (error) { next(error); }
  }

  static async approveSpiffera(req: AuthRequest, res: Response, next: NextFunction) {
    try { 
      const moderatorId = req.user?.sub || req.user?.id;
      if (!moderatorId) throw new Error('Moderatore non identificato');

      res.json({ message: 'Approvata', data: await AdminService.approveConfession(req.params.id, moderatorId) }); 
    } catch (error) { next(error); }
  }

  static async rejectSpiffera(req: AuthRequest, res: Response, next: NextFunction) {
    try { 
      const moderatorId = req.user?.sub || req.user?.id;
      if (!moderatorId) throw new Error('Moderatore non identificato');

      res.json({ message: 'Rifiutata', data: await AdminService.rejectConfession(req.params.id, moderatorId) }); 
    } catch (error) { next(error); }
  }

  // ==========================================
  // 6. GESTIONE EVENTI
  // ==========================================
  static async getAllEvents(req: Request, res: Response, next: NextFunction) {
    try { 
      res.json(await AdminService.getAllEvents()); 
    } catch (error) { next(error); }
  }

  static async approveEvent(req: Request, res: Response, next: NextFunction) {
    try { 
      res.json({ message: 'Approvato', data: await AdminService.approveEvent(req.params.id) }); 
    } catch (error) { next(error); }
  }

  static async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try { 
      await AdminService.deleteEvent(req.params.id); 
      res.json({ message: 'Eliminato' }); 
    } catch (error) { next(error); }
  }

  // ==========================================
  // 7. GESTIONE GRUPPI
  // ==========================================
  static async getAllGroups(req: Request, res: Response, next: NextFunction) {
    try { 
      res.json(await AdminService.getAllGroups()); 
    } catch (error) { next(error); }
  }

  static async deleteGroup(req: Request, res: Response, next: NextFunction) {
    try { 
      await AdminService.deleteGroup(req.params.id); 
      res.json({ message: 'Eliminato' }); 
    } catch (error) { next(error); }
  }

  // ==========================================
  // 8. GESTIONE SEGNALAZIONI
  // ==========================================
  static async getAllReports(req: Request, res: Response, next: NextFunction) {
    try { 
      res.json(await AdminService.getAllReports()); 
    } catch (error) { next(error); }
  }

  static async resolveReport(req: AuthRequest, res: Response, next: NextFunction) {
    try { 
      const resolverId = req.user?.sub || req.user?.id;
      if (!resolverId) throw new Error('Utente non identificato');

      res.json({ message: 'Risolto', data: await AdminService.resolveReport(req.params.id, resolverId) }); 
    } catch (error) { next(error); }
  }

  static async dismissReport(req: AuthRequest, res: Response, next: NextFunction) {
    try { 
      const resolverId = req.user?.sub || req.user?.id;
      if (!resolverId) throw new Error('Utente non identificato');

      res.json({ message: 'Ignorato', data: await AdminService.dismissReport(req.params.id, resolverId) }); 
    } catch (error) { next(error); }
  }

  // ==========================================
  // 9. GESTIONE ANNUNCI (BACHECA)
  // ==========================================
  static async getAllBoardPosts(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await AdminService.getAllBoardPosts());
    } catch (error) { next(error); }
  }

  static async deleteBoardPost(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteAnyBoardPost(req.params.id);
      res.json({ message: 'Annuncio eliminato' });
    } catch (error) { next(error); }
  }

    // ==========================================
  // 10. GESTIONE MBARE COIN
  // ==========================================
  static async getCoinDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await AdminService.getCoinDashboard());
    } catch (error) { next(error); }
  }

  static async adjustTokens(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, amount, reason } = req.body;
      if (!userId || amount === undefined) {
        return res.status(400).json({ error: 'userId e amount sono obbligatori' });
      }
      const result = await AdminService.adjustTokens(userId, Number(amount), reason);
      res.json({ message: 'Token aggiornati con successo', data: result });
    } catch (error) { next(error); }
  }

  static async broadcastNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, message } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: 'Titolo e messaggio sono obbligatori' });
      }
      await AdminService.broadcastNotification(title, message);
      res.json({ message: 'Notifica inviata a tutti gli utenti!' });
    } catch (error) { next(error); }
  }
}