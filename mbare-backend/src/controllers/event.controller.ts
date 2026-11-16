import type { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event.service.js';
import type { AuthRequest } from '../middleware/auth.js';

export class EventController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await EventService.getAllApproved();
      res.json(events);
    } catch (error) { next(error); }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const event = await EventService.create(req.body, req.user.sub);
      res.status(201).json({ message: 'Evento creato! In attesa di approvazione.', data: event });
    } catch (error) { next(error); }
  }

  // NUOVO: Recupera eventi in attesa di approvazione
  static async getPending(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await EventService.getPending();
      res.json(events);
    } catch (error) { next(error); }
  }

  // NUOVO: Approva un evento
  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await EventService.approve(req.params.id);
      res.json({ message: 'Evento approvato!', data: updated });
    } catch (error) { next(error); }
  }
}