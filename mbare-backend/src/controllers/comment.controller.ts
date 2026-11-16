import type { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class CommentController {
  // GET /api/comments/:targetType/:targetId
  static async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId } = req.params;
      
      if (!['POST', 'CONFESSION'].includes(targetType)) {
        throw AppError.badRequest('Tipo di target non valido.');
      }

      res.json(await CommentService.getComments(targetType as any, targetId));
    } catch (error) { next(error); }
  }

  // POST /api/comments/:targetType/:targetId
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId } = req.params;
      const { content, authorName, parentId } = req.body;
      const userId = req.user?.sub || req.user?.id;

      if (!userId) throw AppError.badRequest('Devi essere loggato per commentare.');
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
      const { id } = req.params;
      const userId = req.user?.sub || req.user?.id;
      const userRole = req.user?.user_role || 'USER';

      if (!userId) throw AppError.badRequest('Utente non identificato.');

      await CommentService.delete(BigInt(id), userId, userRole);
      res.json({ message: 'Commento eliminato.' });
    } catch (error) { next(error); }
  }
}