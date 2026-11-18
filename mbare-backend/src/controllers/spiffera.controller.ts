
import type { Request, Response, NextFunction } from 'express';
import { SpifferaService } from '../services/spiffera.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class SpifferaController {

  /**
   * GET /api/confessions
   * Recupera le spifferate approvate (feed pubblico).
   */
  static async getApproved(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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
  static async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authorId = req.user?.sub || req.user?.id;

      if (!authorId) {
        throw AppError.badRequest(
          'Devi essere loggato per spifferare.'
        );
      }

      const { content, category, spicyLevel, score } = req.body;

      // Validazione contenuto
      if (
        typeof content !== 'string' ||
        content.trim().length < 20
      ) {
        throw AppError.badRequest(
          'Minchia, scrivi almeno 20 caratteri! Non si capisce niente.'
        );
      }

      if (content.trim().length > 1000) {
        throw AppError.badRequest(
          'La spifferata non può superare 1000 caratteri.'
        );
      }

      // Categorie consentite
      const validCategories = [
        'SPICY',
        'CRINGE',
        'UNI',
        'DRAMA',
        'UNPOPULAR'
      ];

      const finalCategory =
        typeof category === 'string' &&
        validCategories.includes(category)
          ? category
          : 'SPICY';

      // Compatibilità frontend nuovo e precedente
      const rawSpicy = spicyLevel ?? score;

      const finalSpicyLevel =
        typeof rawSpicy === 'number' &&
        Number.isFinite(rawSpicy) &&
        rawSpicy >= 0 &&
        rawSpicy <= 100
          ? rawSpicy
          : 50;

      const newSpiffera = await SpifferaService.create(
        content.trim(),
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
   * Recupera le spifferate in attesa.
   */
  static async getPending(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const spifferate = await SpifferaService.getPending();

      res.json(spifferate);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/super-admin/confessions/history
   * Recupera lo storico delle spifferate.
   */
  static async getHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const spifferate = await SpifferaService.getHistory();

      res.json(spifferate);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/super-admin/confessions/:id/approve
   * Approva una spifferata.
   */
  static async approve(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = req.params.id;
      const moderatorId = req.user?.sub || req.user?.id;

      // Verifica che ID sia una stringa
      if (typeof id !== 'string' || !id.trim()) {
        throw AppError.badRequest(
          'ID spifferata mancante o non valido'
        );
      }

      if (!moderatorId) {
        throw AppError.badRequest(
          'Moderatore non identificato'
        );
      }

      const updated = await SpifferaService.approve(
        id,
        moderatorId
      );

      res.json({
        message: 'Approvata!',
        data: updated
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/super-admin/confessions/:id/reject
   * Rifiuta una spifferata.
   */
  static async reject(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = req.params.id;
      const moderatorId = req.user?.sub || req.user?.id;

      // Verifica che ID sia una stringa
      if (typeof id !== 'string' || !id.trim()) {
        throw AppError.badRequest(
          'ID spifferata mancante o non valido'
        );
      }

      if (!moderatorId) {
        throw AppError.badRequest(
          'Moderatore non identificato'
        );
      }

      const updated = await SpifferaService.reject(
        id,
        moderatorId
      );

      res.json({
        message: 'Rifiutata!',
        data: updated
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/super-admin/confessions/:id
   * Elimina definitivamente una spifferata.
   */
  static async deleteSpiffera(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = req.params.id;

      // Verifica che ID sia una stringa
      if (typeof id !== 'string' || !id.trim()) {
        throw AppError.badRequest(
          'ID spifferata mancante o non valido'
        );
      }

      await SpifferaService.deleteSpiffera(id);

      res.json({
        message: 'Spifferata eliminata definitivamente.'
      });

    } catch (error) {
      next(error);
    }
  }
}
