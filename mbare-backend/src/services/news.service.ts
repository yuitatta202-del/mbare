import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

export class NewsService {
  /**
   * Legge tutte le news pubblicate (per il pubblico).
   */
  static async getPublishedNews() {
    return await prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        author: { select: { username: true } }
      },
    });
  }

  /**
   * Legge tutte le news, incluse bozze e archiviate (per admin).
   */
  static async getAllNews() {
    return await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        category: { select: { name: true } },
        author: { select: { username: true } } 
      },
    });
  }

  /**
   * Legge una singola news tramite lo slug.
   */
  static async getNewsBySlug(slug: string) {
    const news = await prisma.post.findUnique({
      where: { slug },
      include: { 
        category: { select: { name: true } },
        author: { select: { username: true } } 
      },
    });

    if (!news) {
      throw AppError.notFound('News non trovata. Forse l\'hannu manciata?');
    }

    return news;
  }

  /**
   * Crea una nuova news.
   * Supporta Markdown o HTML nel campo `content`.
   */
  static async createNews(data: any, authorId: string) {
    // Validazione
    if (!data.title || !data.content) {
      throw AppError.badRequest('Minchia, manca quarchi cosa! Riempi titolo e contenuto.');
    }

    // Genera slug automatico se non fornito
    const slug = data.slug || data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Validazione status
    const validStatuses = ['draft', 'published', 'archived'];
    const status = validStatuses.includes(data.status) ? data.status : 'published';

    // 1. Gestione e validazione Tags
    let parsedTags: string[] = [];
    if (Array.isArray(data.tags)) {
      parsedTags = data.tags.filter((t: any) => typeof t === 'string' && t.trim() !== '');
    } else if (typeof data.tags === 'string') {
      parsedTags = data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
    }

    // 2. Gestione della Categoria (conversione a BigInt per Prisma)
    let categoryId: bigint | null = null;
    if (data.categoryId) {
      try {
        categoryId = BigInt(data.categoryId);
      } catch (e) {
        console.warn("Categoria non valida passata dal frontend:", data.categoryId);
      }
    }

    try {
      return await prisma.post.create({
        data: {
          title: data.title,
          slug,
          content: data.content,
          excerpt: data.excerpt || null,
          featuredImage: data.featuredImage || null,
          status,
          tags: parsedTags,
          authorId,
          categoryId,
        },
      });
    } catch (error: any) {
      // 1. Gestione Slug duplicato
      if (error.code === 'P2002') {
        throw AppError.conflict('Questo slug è già in uso. Cambia titolo o slug.');
      }
      
      // 2. Gestione Profilo Utente o Categoria non trovati (Foreign Key)
      if (error.code === 'P2003') {
        throw AppError.badRequest('Il profilo utente o la categoria selezionata non esistono nel database.');
      }

      console.error('Errore creazione news:', error);
      throw AppError.internal('Ahi ahi, quarchi cosa si rumpiu ntô database.');
    }
  }

  /**
   * Aggiorna una news esistente.
   */
  static async updateNews(id: bigint, data: any) {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('News non trovata.');
    }

    // Gestione tags in caso di aggiornamento
    let parsedTags = existing.tags;
    if (data.tags !== undefined) {
      if (Array.isArray(data.tags)) {
        parsedTags = data.tags.filter((t: any) => typeof t === 'string' && t.trim() !== '');
      } else if (typeof data.tags === 'string') {
        parsedTags = data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
      }
    }

    // Gestione categoria in caso di aggiornamento
    let categoryId: bigint | null = existing.categoryId;
    if (data.categoryId !== undefined) {
      if (data.categoryId === null || data.categoryId === '') {
        categoryId = null;
      } else {
        try {
          categoryId = BigInt(data.categoryId);
        } catch (e) {
          categoryId = existing.categoryId;
        }
      }
    }

    // Gestione slug (se arriva vuoto, mantiene il vecchio o lo genera dal titolo)
    let finalSlug = data.slug !== undefined ? data.slug : existing.slug;
    if (!finalSlug) {
      const titleToUse = data.title || existing.title;
      finalSlug = titleToUse.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    try {
      return await prisma.post.update({
        where: { id },
        data: {
          title: data.title ?? existing.title,
          slug: finalSlug,
          content: data.content ?? existing.content,
          // Se i campi opzionali arrivano come stringa vuota "", li salviamo come null
          excerpt: data.excerpt !== undefined ? (data.excerpt || null) : existing.excerpt,
          featuredImage: data.featuredImage !== undefined ? (data.featuredImage || null) : existing.featuredImage,
          status: data.status ?? existing.status,
          tags: parsedTags,
          categoryId: categoryId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw AppError.conflict('Questo slug è già in uso. Scegline un altro.');
      }
      console.error('Errore aggiornamento news:', error);
      throw AppError.internal('Ahi ahi, quarchi cosa si rumpiu duranti l\'aggiornamento.');
    }
  }

  /**
   * Elimina una news.
   */
  static async deleteNews(id: bigint) {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('News non trovata.');
    }

    return await prisma.post.delete({ where: { id } });
  }
}