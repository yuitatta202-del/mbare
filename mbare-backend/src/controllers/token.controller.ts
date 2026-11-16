import type { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class TokenController {
  // GET /api/tokens/wallet
  static async getMyWallet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const wallet = await TokenService.getWallet(req.user.sub);
      res.json(wallet);
    } catch (error) { next(error); }
  }

  // POST /api/tokens/arcade/claim
  // L'utente chiama questa rotta quando vince a un gioco
  static async claimArcadeReward(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { gameId } = req.body;
      
      // Validazione: i giochi validi
      const validGames = ['REACTION', 'CLICKER', 'MEMORY'];
      if (!validGames.includes(gameId)) {
        throw AppError.badRequest('Gioco non valido!');
      }

      // Assegniamo 10 token come premio
      const rewardAmount = 10;
      
      const wallet = await TokenService.addTokens(
        req.user.sub, 
        rewardAmount, 
        'ARCADE_WIN', 
        gameId
      );

      res.json({ 
        message: `Complimenti! Hai guadagnato ${rewardAmount} Mbare Coin!`, 
        wallet 
      });
    } catch (error) { next(error); }
  }

  // POST /api/tokens/spend
  // Rotta generica per spendere token (es. sponsorizzare)
  static async spend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { amount, reason, referenceId } = req.body;

      if (!amount || !reason) {
        throw AppError.badRequest('Mancano i dati per la spesa');
      }

      const wallet = await TokenService.spendTokens(
        req.user.sub,
        amount,
        reason,
        referenceId
      );

      res.json({ message: 'Token spesi con successo', wallet });
    } catch (error) { next(error); }
  }
}