import type { Request, Response, NextFunction } from 'express';
import { NewsService } from '../services/news.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class NewsController {
  /**
   * GET /api/news
   * Recupera tutte le news pubblicate (per il pubblico).
   */
  static async getPublished(req: Request, res: Response, next: NextFunction) {
    try {
      const news = await NewsService.getPublishedNews();
      res.json(news);
    } catch (error) { 
      next(error); 
    }
  }

  /**
   * GET /api/news/admin/all
   * Recupera tutte le news, incluse bozze e archiviate (per admin).
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const news = await NewsService.getAllNews();
      res.json(news);
    } catch (error) { 
      next(error); 
    }
  }

  /**
   * GET /api/news/:slug
   * Recupera una singola news tramite lo slug.
   */
  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      // FIX: Cast a string per TypeScript
      const slug = req.params.slug as string;
      if (!slug) throw AppError.badRequest('Slug mancante.');

      const news = await NewsService.getNewsBySlug(slug);
      res.json(news);
    } catch (error) { 
      next(error); 
    }
  }

  /**
   * POST /api/news/admin/create (o /api/super-admin/news)
   * Crea una nuova news.
   */
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const authorId = req.user?.sub || req.user?.id;
      
      if (!authorId) {
        throw AppError.badRequest('Impossibile identificare l\'utente. Rieffettua il login.');
      }

      const post = await NewsService.createNews(req.body, authorId);
      res.status(201).json(post);
    } catch (error) { 
      next(error); 
    }
  }

  /**
   * PUT /api/news/admin/:id
   * Aggiorna una news esistente.
   */
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // FIX: Cast a string per TypeScript
      const rawId = req.params.id as string;
      if (!rawId) throw AppError.badRequest('ID news mancante.');

      let id: bigint;
      try {
        id = BigInt(rawId);
      } catch (e) {
        throw AppError.badRequest('ID news non valido, minchia!');
      }

      const allowedFields = [
        'title', 'slug', 'content', 'excerpt', 
        'featuredImage', 'status', 'tags', 'categoryId'
      ];
      
      const updateData: any = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          updateData[key] = req.body[key];
        }
      }

      const updated = await NewsService.updateNews(id, updateData);
      res.json(updated);
    } catch (error) { 
      next(error); 
    }
  }

  /**
   * DELETE /api/news/admin/:id
   * Elimina una news.
   */
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // FIX: Cast a string per TypeScript
      const rawId = req.params.id as string;
      if (!rawId) throw AppError.badRequest('ID news mancante.');

      let id: bigint;
      try {
        id = BigInt(rawId);
      } catch (e) {
        throw AppError.badRequest('ID news non valido, minchia!');
      }

      await NewsService.deleteNews(id);
      res.json({ message: 'News eliminata' });
    } catch (error) { 
      next(error); 
    }
  }
}