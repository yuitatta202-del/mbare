import type { Request, Response, NextFunction } from 'express';
import { GroupService } from '../services/group.service.js';
import type { AuthRequest } from '../middleware/auth.js';

export class GroupController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await GroupService.getAll();
      res.json(groups);
    } catch (error) { next(error); }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await GroupService.create(req.body, req.user.sub);
      res.status(201).json({ message: 'Gruppo creato!', data: group });
    } catch (error) { next(error); }
  }

  static async join(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await GroupService.join(req.params.id, req.user.sub);
      res.json({ message: 'Ti sei unito al gruppo!' });
    } catch (error) { next(error); }
  }
}