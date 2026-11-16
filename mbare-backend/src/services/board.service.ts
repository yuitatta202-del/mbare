import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { TokenService } from './token.service.js';

export class BoardService {
  static async getAll() {
    return await prisma.boardPost.findMany({
      where: { status: 'active' },
      orderBy: [
        { bumped_at: 'desc' },   // <-- snake_case esatto
        { createdAt: 'desc' }    // <-- camelCase esatto (perché ha @map)
      ],
      include: { author: { select: { username: true, role: true } } },
    });
  }

  static async getById(id: string) {
    const post = await prisma.boardPost.findUnique({
      where: { id },
      include: { author: { select: { username: true, role: true, avatarUrl: true } } }
    });
    if (!post) throw AppError.notFound('Annuncio non trovato.');
    return post;
  }

  static async create(data: any, authorId: string) {
    if (!data.title || !data.content || !data.category) {
      throw AppError.badRequest('Manca quarchi cosa, riempi tutti i campi!');
    }

    const validTypes = ['CERCO', 'OFFRO', 'VENDO', 'REGALO'];
    const type = validTypes.includes(data.type) ? data.type : 'OFFRO';

    const validCategories = ['STANZE', 'BIGLIETTI', 'LIBRI', 'OGGETTI', 'STUDIO', 'PASSAGGI', 'ALTRO'];
    const category = validCategories.includes(data.category) ? data.category : 'ALTRO';

    let price = null;
    if (data.price !== undefined && data.price !== null && data.price !== '') {
      const parsedPrice = parseFloat(data.price);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) price = parsedPrice;
    }

    let tags: string[] = [];
    if (Array.isArray(data.tags)) {
      tags = data.tags.filter((t: any) => typeof t === 'string' && t.trim() !== '').map((t: string) => t.trim().toLowerCase());
    }

    let images: string[] = [];
    if (Array.isArray(data.images)) {
      images = data.images.filter((i: any) => typeof i === 'string' && i.trim() !== '');
    } else if (typeof data.imageUrl === 'string' && data.imageUrl.trim() !== '') {
      images = [data.imageUrl.trim()];
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    try {
      return await prisma.boardPost.create({
        data: {
          title: data.title.trim(),
          content: data.content.trim(),
          category,
          type,
          tags,
          price,
          city: data.city?.trim() || null,
          images,
          expires_at: expiresAt,   // <-- snake_case esatto
          status: 'active',
          authorId,
        },
      });
    } catch (error: any) {
      console.error('Errore creazione annuncio:', error);
      throw AppError.internal('Ahi ahi, quarchi cosa si rumpiu ntô database. Riprova!');
    }
  }

  static async update(id: string, data: any, userId: string) {
    const post = await prisma.boardPost.findUnique({ where: { id } });
    if (!post) throw AppError.notFound('Annuncio non trovato.');
    if (post.authorId !== userId) throw AppError.forbidden('Non puoi modificare un annuncio che non è tuo.');

    let updatedImages = post.images;
    if (data.images !== undefined) {
      updatedImages = Array.isArray(data.images) ? data.images : [data.images];
    } else if (data.imageUrl !== undefined) {
      updatedImages = data.imageUrl ? [data.imageUrl] : [];
    }

    return await prisma.boardPost.update({
      where: { id },
      data: {
        title: data.title ?? post.title,
        content: data.content ?? post.content,
        category: data.category ?? post.category,
        type: data.type ?? post.type,
        tags: data.tags ?? post.tags,
        price: data.price !== undefined ? (data.price ? parseFloat(data.price) : null) : post.price,
        city: data.city !== undefined ? data.city : post.city,
        images: updatedImages,
      },
    });
  }

  static async delete(id: string, userId: string, userRole: string = 'USER') {
    const post = await prisma.boardPost.findUnique({ where: { id } });
    if (!post) throw AppError.notFound('Annuncio non trovato.');
    
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(userRole);
    if (post.authorId !== userId && !isAdmin) throw AppError.forbidden('Nun ci pensari propriu! Non puoi eliminare un annuncio che non è tuo.');
    
    return await prisma.boardPost.delete({ where: { id } });
  }

  static async incrementView(id: string) {
    return await prisma.boardPost.update({
      where: { id },
      data: { view_count: { increment: 1 } }  // <-- snake_case esatto
    });
  }

  static async toggleSave(postId: string, userId: string) {
    const post = await prisma.boardPost.findUnique({ where: { id: postId } });
    if (!post) throw AppError.notFound('Annuncio non trovato.');

    const existing = await prisma.saved_board_posts.findUnique({
      where: { user_id_board_post_id: { user_id: userId, board_post_id: postId } }
    });

    if (existing) {
      await prisma.saved_board_posts.delete({ where: { id: existing.id } });
      return { saved: false, message: 'Rimosso dai preferiti' };
    } else {
      await prisma.saved_board_posts.create({
        data: { user_id: userId, board_post_id: postId }
      });
      return { saved: true, message: 'Salvato nei preferiti!' };
    }
  }

  static async getSavedPosts(userId: string) {
    return await prisma.saved_board_posts.findMany({
      where: { user_id: userId },
      include: {
        board_posts: {
          include: { author: { select: { username: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  static async bumpPost(id: string, userId: string) {
    const post = await prisma.boardPost.findUnique({ where: { id } });
    if (!post) throw AppError.notFound('Annuncio non trovato.');
    if (post.authorId !== userId) throw AppError.forbidden('Non puoi bumpare un annuncio che non è tuo.');

    const COST = 20;
    await TokenService.spendTokens(userId, COST, `Bump annuncio: ${post.title}`);

    return await prisma.boardPost.update({
      where: { id },
      data: { bumped_at: new Date() }  // <-- snake_case esatto
    });
  }
  /**
 * Avvia o recupera una conversazione legata a un annuncio.
 * Se l'utente è l'autore, non può contattare se stesso.
 */
static async startConversation(postId: string, userId: string) {
  const post = await prisma.boardPost.findUnique({ where: { id: postId } });
  if (!post) throw AppError.notFound('Annuncio non trovato.');
  if (post.authorId === userId) throw AppError.badRequest('Non puoi contattare te stesso!');
  if (!post.authorId) throw AppError.badRequest('L\'autore dell\'annuncio non è disponibile.');

  // Cerca se esiste già una conversazione per questo annuncio tra i due utenti
  const existing = await prisma.conversation.findFirst({
    where: {
      contextType: 'BOARD_POST', // <-- camelCase
      contextId: postId,          // <-- camelCase
      AND: [
        { conversation_participants: { some: { user_id: userId } } },
        { conversation_participants: { some: { user_id: post.authorId } } }
      ]
    }
  });

  if (existing) return existing.id;

  // Crea nuova conversazione
  const newConv = await prisma.conversation.create({
    data: {
      contextType: 'BOARD_POST',
      contextId: postId,
      isActive: true,             // <-- camelCase
      conversation_participants: {
        create: [
          { user_id: userId },
          { user_id: post.authorId }
        ]
      }
    }
  });

  return newConv.id;
}
}