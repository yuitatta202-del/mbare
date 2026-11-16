import type { Request, Response, NextFunction } from 'express';
import { BoardService } from '../services/board.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class BoardController {
  /**
   * GET /api/board
   * Recupera tutti gli annunci.
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await BoardService.getAll();
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/board/:id
   * Recupera un singolo annuncio tramite ID.
   */
  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!id) throw AppError.badRequest('ID annuncio mancante.');

      const post = await BoardService.getById(id);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/board
   * Crea un nuovo annuncio.
   */
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const authorId = req.user?.sub || req.user?.id;
      if (!authorId) throw AppError.badRequest('Devi essere loggato per pubblicare un annuncio.');

      const { title, content, category } = req.body;

      // Controllo di base per evitare di far partire richieste inutili al database
      if (!title || !content || !category) {
        throw AppError.badRequest('Minchia, manca quarchi cosa! Riempi titolo, descrizione e categoria.');
      }

      const post = await BoardService.create(req.body, authorId);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/board/:id
   * Modifica un annuncio esistente (solo l'autore).
   */
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub || req.user?.id;
      const id = req.params.id as string;

      if (!userId) throw AppError.badRequest('Devi essere loggato per modificare un annuncio.');
      if (!id) throw AppError.badRequest('ID annuncio mancante.');

      const updated = await BoardService.update(id, req.body, userId);
      res.json({ message: 'Annuncio aggiornato', data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/board/:id
   * Elimina un annuncio (autore o admin).
   */
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub || req.user?.id;
      const userRole = req.user?.user_role || 'USER';
      const id = req.params.id as string;

      if (!userId) throw AppError.badRequest('Devi essere loggato per eliminare un annuncio.');
      if (!id) throw AppError.badRequest('ID annuncio mancante.');

      await BoardService.delete(id, userId, userRole);
      res.json({ message: 'Annuncio eliminato' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/board/:id/view
   * Incrementa il contatore delle visualizzazioni.
   */
  static async incrementView(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!id) throw AppError.badRequest('ID annuncio mancante.');

      await BoardService.incrementView(id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/board/:id/save
   * Aggiunge/Rimuove un annuncio dai preferiti dell'utente.
   */
  static async toggleSave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub || req.user?.id;
      const id = req.params.id as string;

      if (!userId) throw AppError.badRequest('Devi essere loggato per salvare un annuncio.');
      if (!id) throw AppError.badRequest('ID annuncio mancante.');

      const result = await BoardService.toggleSave(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/board/user/saved
   * Recupera tutti gli annunci salvati dall'utente.
   */
  static async getSaved(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) throw AppError.badRequest('Devi essere loggato per vedere i preferiti.');

      const saved = await BoardService.getSavedPosts(userId);
      res.json(saved);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/board/:id/bump
   * Spinge l'annuncio in cima pagando con Mbare Coin.
   */
  static async bump(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub || req.user?.id;
      const id = req.params.id as string;

      if (!userId) throw AppError.badRequest('Devi essere loggato per bumpare un annuncio.');
      if (!id) throw AppError.badRequest('ID annuncio mancante.');

      const result = await BoardService.bumpPost(id, userId);
      res.json({ message: 'Annuncio spinto in cima!', data: result });
    } catch (error) {
      next(error);
    }
  }
  static async contact(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub || req.user?.id;
    const postId = req.params.id as string;
    if (!userId) throw AppError.badRequest('Devi essere loggato per contattare l\'autore.');
    if (!postId) throw AppError.badRequest('ID annuncio mancante.');

    const conversationId = await BoardService.startConversation(postId, userId);
    res.json({ conversationId });
  } catch (error) { next(error); }
}
}