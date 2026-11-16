import type { Request, Response, NextFunction } from 'express';
import { SpifferaService } from '../services/spiffera.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class SpifferaController {
  /**
   * GET /api/confessions
   * Recupera le spifferate approvate (per il feed pubblico).
   */
  static async getApproved(req: Request, res: Response, next: NextFunction) {
    try {
      const spifferate = await SpifferaService.getApproved();
      res.json(spifferate);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/confessions
   * Invia una nuova spifferata.
   */
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Estrazione sicura dell'ID utente
      const authorId = req.user?.sub || req.user?.id;
      if (!authorId) throw AppError.badRequest('Devi essere loggato per spifferare.');

      const { content, category, spicyLevel, score } = req.body;

      // Validazione base
      if (!content || content.trim().length < 20) {
        throw AppError.badRequest('Minchia, scrivi almeno 20 caratteri! Non si capisce niente.');
      }

      // Validazione categoria (Assicurati che questi valori esistano nel tuo ENUM su Supabase)
      const validCategories = ['SPICY', 'CRINGE', 'UNI', 'DRAMA', 'UNPOPULAR'];
      const finalCategory = validCategories.includes(category) ? category : 'SPICY';

      // Validazione livello Spicy (gestiamo sia 'spicyLevel' che 'score' nel caso il frontend usi il vecchio nome)
      const rawSpicy = spicyLevel ?? score;
      const finalSpicyLevel = typeof rawSpicy === 'number' && rawSpicy >= 0 && rawSpicy <= 100 ? rawSpicy : 50;

      const newSpiffera = await SpifferaService.create(
        content,
        finalCategory,
        authorId,
        finalSpicyLevel
      );

      res.status(201).json({ 
        message: 'Spifferato! In attesa di approvazione.', 
        data: newSpiffera 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/super-admin/confessions/pending
   * Recupera le spifferate in attesa (per admin).
   */
  static async getPending(req: Request, res: Response, next: NextFunction) {
    try {
      const spifferate = await SpifferaService.getPending();
      res.json(spifferate);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/super-admin/confessions/history
   * Recupera lo storico (Approvate e Rifiutate).
   */
  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const spifferate = await SpifferaService.getHistory();
      res.json(spifferate);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/super-admin/confessions/:id/approve
   * Approva una spifferata (per admin).
   */
  static async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const moderatorId = req.user?.sub || req.user?.id;
      
      if (!id) throw AppError.badRequest('ID spifferata mancante');
      if (!moderatorId) throw AppError.badRequest('Moderatore non identificato');

      const updated = await SpifferaService.approve(id, moderatorId);
      res.json({ message: 'Approvata!', data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/super-admin/confessions/:id/reject
   * Rifiuta una spifferata (per admin).
   */
  static async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const moderatorId = req.user?.sub || req.user?.id;

      if (!id) throw AppError.badRequest('ID spifferata mancante');
      if (!moderatorId) throw AppError.badRequest('Moderatore non identificato');

      const updated = await SpifferaService.reject(id, moderatorId);
      res.json({ message: 'Rifiutata!', data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/super-admin/confessions/:id
   * Elimina definitivamente una spifferata (per admin).
   */
  static async deleteSpiffera(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw AppError.badRequest('ID spifferata mancante');

      await SpifferaService.deleteSpiffera(id);
      res.json({ message: 'Spifferata eliminata definitivamente.' });
    } catch (error) {
      next(error);
    }
  }
}