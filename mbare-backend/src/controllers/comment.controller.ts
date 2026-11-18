import type { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class CommentController {
  // GET /api/comments/:targetType/:targetId
  static async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      // FIX: Cast a string per TypeScript
      const targetType = req.params.targetType as string;
      const targetId = req.params.targetId as string;
      
      if (!targetType || !targetId) {
        throw AppError.badRequest('Parametri mancanti.');
      }

      if (!['POST', 'CONFESSION'].includes(targetType)) {
        throw AppError.badRequest('Tipo di target non valido.');
      }

      res.json(await CommentService.getComments(targetType as any, targetId));
    } catch (error) { next(error); }
  }

  // POST /api/comments/:targetType/:targetId
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // FIX: Cast a string per TypeScript
      const targetType = req.params.targetType as string;
      const targetId = req.params.targetId as string;
      const { content, authorName, parentId } = req.body;
      const userId = req.user?.sub || req.user?.id;

      if (!userId) throw AppError.badRequest('Devi essere loggato per commentare.');
      if (!targetType || !targetId) throw AppError.badRequest('Parametri mancanti.');
      if (!['POST', 'CONFESSION'].includes(targetType)) throw AppError.badRequest('Tipo di target non valido.');

      const comment = await CommentService.create({
        targetType: targetType as any,
        targetId,
        content,
        authorId: userId,
        authorName,
        parentId
      });

      res.status(201).json(comment);
    } catch (error) { next(error); }
  }

  // DELETE /api/comments/:id
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // FIX: Cast a string per TypeScript
      const id = req.params.id as string; 
      const userId = req.user?.sub || req.user?.id;
      const userRole = req.user?.user_role || 'USER';

      if (!userId) throw AppError.badRequest('Utente non identificato.');
      if (!id) throw AppError.badRequest('ID commento mancante.');

      await CommentService.delete(BigInt(id), userId, userRole);
      res.json({ message: 'Commento eliminato.' });
    } catch (error) { next(error); }
  }
}