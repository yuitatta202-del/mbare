import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { spiffera_category } from '@prisma/client';

export class SpifferaService {
  /**
   * Recupera le spifferate approvate (per il feed pubblico).
   */
  static async getApproved() {
    return await prisma.spiffera.findMany({
      where: { status: 'approved', deletedAt: null }, // Assicuriamoci che non sia stata cancellata
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Crea una nuova spifferata.
   */
  static async create(content: string, category: string, authorId: string, spicyLevel: number = 50) {
    if (!content || content.length < 20 || content.length > 1000) {
      throw AppError.badRequest('La spifferata deve essere tra 20 e 1000 caratteri, minchia!');
    }

    const validCategories = Object.values(spiffera_category);
    if (!validCategories.includes(category as spiffera_category)) {
      throw AppError.badRequest(`Categoria non valida: ${category}. Scegli tra: ${validCategories.join(', ')}`);
    }

    return await prisma.spiffera.create({
      data: {
        content,
        category: category as spiffera_category,
        spicyLevel: spicyLevel,
        authorId,
        status: 'pending',
      },
    });
  }

  /**
   * Admin: Legge le spifferate in attesa.
   */
  static async getPending() {
    return await prisma.spiffera.findMany({
      where: { status: 'pending', deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Admin: Legge lo storico (Approvate e Rifiutate).
   */
  static async getHistory() {
    return await prisma.spiffera.findMany({
      where: { 
        status: { in: ['approved', 'rejected'] },
        deletedAt: null 
      },
      orderBy: { updatedAt: 'desc' },
      take: 50, // Carica solo le ultime 50 per non intasare il browser
    });
  }

  /**
   * Admin: Approva una spifferata.
   */
  static async approve(id: string, moderatorId: string) {
    const spiffera = await prisma.spiffera.findUnique({ where: { id } });
    if (!spiffera) {
      throw AppError.notFound('Spifferata non trovata. Forse l\'hannu manciata?');
    }

    return await prisma.spiffera.update({
      where: { id },
      data: { 
        status: 'approved',
        approvedAt: new Date(),
        moderatedBy: moderatorId 
      }
    });
  }

  /**
   * Admin: Rifiuta una spifferata.
   */
  static async reject(id: string, moderatorId: string) {
    const spiffera = await prisma.spiffera.findUnique({ where: { id } });
    if (!spiffera) {
      throw AppError.notFound('Spifferata non trovata.');
    }

    return await prisma.spiffera.update({
      where: { id },
      data: { 
        status: 'rejected',
        moderatedBy: moderatorId 
      }
    });
  }

  /**
   * Admin: Elimina definitivamente una spifferata (Hard Delete).
   * Se preferisci il soft delete, puoi cambiare la query in update impostando status: 'removed' e deletedAt: new Date().
   */
  static async deleteSpiffera(id: string) {
    const spiffera = await prisma.spiffera.findUnique({ where: { id } });
    if (!spiffera) {
      throw AppError.notFound('Spifferata non trovata.');
    }

    // Hard delete: la rimuove dal database
    return await prisma.spiffera.delete({
      where: { id }
    });
  }
}