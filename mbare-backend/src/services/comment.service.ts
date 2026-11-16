import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { ModerationService } from './moderation.service.js'; // <-- IMPORT AGGIUNTO

type TargetType = 'POST' | 'CONFESSION';

export class CommentService {
  /**
   * Recupera i commenti per un target specifico (News o Spiffera)
   */
  static async getComments(targetType: TargetType, targetId: string) {
    let originalAuthorId: string | null = null;
    
    if (targetType === 'POST') {
      const post = await prisma.post.findUnique({ where: { id: BigInt(targetId) }, select: { authorId: true } });
      originalAuthorId = post?.authorId || null;
    } else {
      const spiffera = await prisma.spiffera.findUnique({ where: { id: targetId }, select: { authorId: true } });
      originalAuthorId = spiffera?.authorId || null;
    }

    const whereClause: any = {
      status: 'approved', // Prendiamo SOLO i commenti approvati
      deletedAt: null,
      parentId: null, 
    };

    if (targetType === 'POST') {
      whereClause.postId = BigInt(targetId);
    } else {
      whereClause.spifferaId = targetId;
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        replies: {
          where: { status: 'approved', deletedAt: null },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const enrich = (c: any) => {
      const isOp = c.authorId && c.authorId === originalAuthorId;
      const hasCustomName = c.authorName && c.authorName.trim() !== '';
      
      return {
        ...c,
        isOp: isOp && !hasCustomName,
        displayName: hasCustomName 
          ? c.authorName 
          : (isOp ? 'Autore Originale' : 'Anonimo')
      };
    };

    return comments.map(c => ({
      ...enrich(c),
      replies: c.replies.map((r: any) => enrich(r))
    }));
  }

  /**
   * Crea un commento o una risposta con moderazione automatica
   */
  static async create(data: { 
    targetType: TargetType;
    targetId: string;
    content: string; 
    authorId: string; 
    authorName?: string;
    parentId?: string;
  }) {
    if (!data.content || data.content.trim().length === 0) {
      throw AppError.badRequest('Il commento non può essere vuoto.');
    }
    if (data.content.length > 500) {
      throw AppError.badRequest('Il commento è troppo lungo (max 500 caratteri).');
    }

    // 🔥 LAYER DI MODERAZIONE AUTOMATICA
    const moderationStatus = await ModerationService.analyzeText(data.content);

    if (moderationStatus === 'rejected') {
      throw AppError.badRequest('Il tuo commento viola le norme della community (parole non consentite o linguaggio offensivo).');
    }

    let finalParentId: bigint | null = null;
    if (data.parentId) {
      finalParentId = BigInt(data.parentId);
      const parent = await prisma.comment.findUnique({ where: { id: finalParentId } });
      if (!parent) throw AppError.notFound('Commento padre non trovato.');
      if (parent.parentId) finalParentId = parent.parentId; // Max 1 livello di risposte
    }

    const targetData = data.targetType === 'POST' 
      ? { postId: BigInt(data.targetId) } 
      : { spifferaId: data.targetId };

    // Salviamo con lo stato deciso dal moderatore automatico ('approved' o 'pending')
    return await prisma.comment.create({
      data: {
        ...targetData,
        content: data.content.trim(),
        parentId: finalParentId,
        authorId: data.authorId,
        authorName: data.authorName?.trim() || null,
        status: moderationStatus, // <-- DINAMICO: approved o pending
      }
    });
  }

  /**
   * Elimina un commento (soft delete)
   */
  static async delete(commentId: bigint, userId: string, userRole: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw AppError.notFound('Commento non trovato.');

    const isOwner = comment.authorId === userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(userRole);

    if (!isOwner && !isAdmin) throw AppError.badRequest('Non hai i permessi per eliminare questo commento.');

    return await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date(), status: 'rejected' }
    });
  }
}