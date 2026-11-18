
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { spiffera_category } from '@prisma/client';

export class SpifferaService {
  private static readonly MAX_CONTENT_LENGTH = 1000;
  private static readonly MIN_CONTENT_LENGTH = 20;
  private static readonly HISTORY_LIMIT = 50;

  /**
   * Valida un identificativo UUID.
   */
  private static validateUUID(id: string, field = 'ID'): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      throw AppError.badRequest(`${field} non valido.`);
    }
  }

  /**
   * GET /api/confessions
   * Recupera le spifferate pubbliche approvate.
   */
  static async getApproved() {
    return prisma.spiffera.findMany({
      where: {
        status: 'approved',
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * POST /api/confessions
   * Crea una spifferata in attesa di approvazione.
   */
  static async create(
    content: string,
    category: string,
    authorId: string,
    spicyLevel: number = 50
  ) {
    if (typeof content !== 'string') {
      throw AppError.badRequest(
        'Il contenuto della spifferata non è valido.'
      );
    }

    const cleanContent = content.trim();

    if (
      cleanContent.length < this.MIN_CONTENT_LENGTH ||
      cleanContent.length > this.MAX_CONTENT_LENGTH
    ) {
      throw AppError.badRequest(
        'La spifferata deve contenere tra 20 e 1000 caratteri, minchia!'
      );
    }

    this.validateUUID(authorId, 'ID autore');

    const validCategories = Object.values(spiffera_category);

    if (
      !validCategories.includes(
        category as spiffera_category
      )
    ) {
      throw AppError.badRequest(
        `Categoria non valida. Valori consentiti: ${validCategories.join(', ')}`
      );
    }

    if (
      !Number.isInteger(spicyLevel) ||
      spicyLevel < 0 ||
      spicyLevel > 100
    ) {
      throw AppError.badRequest(
        'Il livello spicy deve essere un numero intero tra 0 e 100.'
      );
    }

    return prisma.spiffera.create({
      data: {
        content: cleanContent,
        category: category as spiffera_category,
        spicyLevel,
        authorId,
        status: 'pending'
      }
    });
  }

  /**
   * GET /api/super-admin/confessions/pending
   * Recupera le spifferate da moderare.
   */
  static async getPending() {
    return prisma.spiffera.findMany({
      where: {
        status: 'pending',
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  /**
   * GET /api/super-admin/confessions/history
   * Recupera le ultime 50 spifferate moderate.
   */
  static async getHistory() {
    return prisma.spiffera.findMany({
      where: {
        status: {
          in: ['approved', 'rejected']
        },
        deletedAt: null
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: this.HISTORY_LIMIT
    });
  }

  /**
   * PUT /api/super-admin/confessions/:id/approve
   * Approva una spifferata ancora in attesa.
   */
  static async approve(id: string, moderatorId: string) {
    this.validateUUID(id, 'ID spifferata');
    this.validateUUID(moderatorId, 'ID moderatore');

    const result = await prisma.spiffera.updateMany({
      where: {
        id,
        status: 'pending',
        deletedAt: null
      },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        moderatedBy: moderatorId
      }
    });

    if (result.count === 0) {
      const existing = await prisma.spiffera.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          deletedAt: true
        }
      });

      if (!existing || existing.deletedAt !== null) {
        throw AppError.notFound(
          'Spifferata non trovata.'
        );
      }

      throw AppError.badRequest(
        'Questa spifferata è già stata moderata.'
      );
    }

    return prisma.spiffera.findUniqueOrThrow({
      where: { id }
    });
  }

  /**
   * PUT /api/super-admin/confessions/:id/reject
   * Rifiuta una spifferata ancora in attesa.
   */
  static async reject(id: string, moderatorId: string) {
    this.validateUUID(id, 'ID spifferata');
    this.validateUUID(moderatorId, 'ID moderatore');

    const result = await prisma.spiffera.updateMany({
      where: {
        id,
        status: 'pending',
        deletedAt: null
      },
      data: {
        status: 'rejected',
        approvedAt: null,
        moderatedBy: moderatorId
      }
    });

    if (result.count === 0) {
      const existing = await prisma.spiffera.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          deletedAt: true
        }
      });

      if (!existing || existing.deletedAt !== null) {
        throw AppError.notFound(
          'Spifferata non trovata.'
        );
      }

      throw AppError.badRequest(
        'Questa spifferata è già stata moderata.'
      );
    }

    return prisma.spiffera.findUniqueOrThrow({
      where: { id }
    });
  }

  /**
   * DELETE /api/super-admin/confessions/:id
   *
   * Soft delete:
   * Nasconde la spifferata senza cancellarla dal database.
   */
  static async deleteSpiffera(id: string) {
    this.validateUUID(id, 'ID spifferata');

    const result = await prisma.spiffera.updateMany({
      where: {
        id,
        deletedAt: null
      },
      data: {
        status: 'removed',
        deletedAt: new Date()
      }
    });

    if (result.count === 0) {
      throw AppError.notFound(
        'Spifferata non trovata o già eliminata.'
      );
    }

    return {
      success: true,
      message: 'Spifferata rimossa correttamente.'
    };
  }
}
