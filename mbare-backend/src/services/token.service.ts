import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

export class TokenService {
  /**
   * Aggiunge token a un utente (es. premio arcade o approvazione).
   */
  static async addTokens(userId: string, amount: number, reason: string, referenceId?: string) {
    if (amount <= 0) throw AppError.badRequest('L\'importo deve essere positivo, minchia!');

    return await prisma.$transaction(async (tx) => {
      // 1. Trova o crea il wallet
      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: { 
          balance: { increment: amount },
          totalEarned: { increment: amount }
        },
        create: { 
          userId, 
          balance: amount, 
          totalEarned: amount 
        },
      });

      // 2. Registra la transazione (storico)
      await tx.tokenTransaction.create({
        data: {
          userId,
          amount,
          reason,
          referenceId,
        },
      });

      return wallet;
    });
  }

  /**
   * Spende token (es. per sponsorizzare un post).
   */
  static async spendTokens(userId: string, amount: number, reason: string, referenceId?: string) {
    if (amount <= 0) throw AppError.badRequest('L\'importo deve essere positivo');

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet || wallet.balance < amount) {
        throw AppError.badRequest('Minchia, non hai abbastanza Mbare Coin!');
      }

      // 1. Scala i token
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      });

      // 2. Registra la spesa
      await tx.tokenTransaction.create({
        data: {
          userId,
          amount: -amount, // negativo per la spesa
          reason,
          referenceId,
        },
      });

      return updatedWallet;
    });
  }

  /**
   * Recupera il saldo dell'utente.
   */
  static async getWallet(userId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    return wallet || { balance: 0, totalEarned: 0 };
  }
}