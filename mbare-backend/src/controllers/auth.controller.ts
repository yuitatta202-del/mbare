import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import type { AuthRequest } from '../middleware/auth.js';

export class AuthController {
  // POST /api/auth/profile
  static async createProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, matricola, isStudent } = req.body;
      
      const email = req.user?.email;
      
      if (!email) {
        return res.status(400).json({ error: 'Email non trovata nel token di autenticazione' });
      }

      const profile = await AuthService.createProfile(
        req.user.sub,
        username,
        email,
        matricola,
        isStudent
      );
      
      res.status(201).json({ message: 'Profilo creato', data: profile });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me
  static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await AuthService.getProfile(req.user.sub);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/auth/profile
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = await AuthService.updateProfile(req.user.sub, req.body);
      res.json({ message: 'Profilo aggiornato con successo', data: updated });
    } catch (error) {
      next(error);
    }
  }
}