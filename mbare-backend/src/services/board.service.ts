
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { TokenService } from './token.service.js';

export class BoardService {
  private static readonly VALID_TYPES = [
    'CERCO',
    'OFFRO',
    'VENDO',
    'REGALO'
  ];

  private static readonly VALID_CATEGORIES = [
    'STANZE',
    'BIGLIETTI',
    'LIBRI',
    'OGGETTI',
    'STUDIO',
    'PASSAGGI',
    'ALTRO'
  ];

  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  private static validateUUID(value: string): void {
    if (!this.UUID_REGEX.test(value)) {
      throw AppError.badRequest('ID non valido.');
    }
  }

  private static validateText(
    value: unknown,
    field: string,
    min: number,
    max: number
  ): string {
    if (
      typeof value !== 'string' ||
      value.trim().length < min ||
      value.trim().length > max
    ) {
      throw AppError.badRequest(
        `${field}: inserisci tra ${min} e ${max} caratteri.`
      );
    }

    return value.trim();
  }

  private static parsePrice(value: unknown): number | null {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return null;
    }

    if (
      typeof value !== 'string' &&
      typeof value !== 'number'
    ) {
      throw AppError.badRequest('Prezzo non valido.');
    }

    if (
      typeof value === 'string' &&
      value.trim() === ''
    ) {
      return null;
    }

    const price = Number(value);

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      price > 1000000
    ) {
      throw AppError.badRequest(
        'Il prezzo deve essere compreso tra 0 e 1.000.000 euro.'
      );
    }

    return Math.round(price * 100) / 100;
  }

  private static parseStringArray(
    value: unknown,
    maxItems: number = 10
  ): string[] {
    if (!Array.isArray(value)) {
      throw AppError.badRequest(
        'Formato elenco non valido.'
      );
    }

    if (value.length > maxItems) {
      throw AppError.badRequest(
        `Puoi inserire al massimo ${maxItems} elementi.`
      );
    }

    if (
      value.some(
        item =>
          typeof item !== 'string' ||
          item.trim().length === 0 ||
          item.length > 2048
      )
    ) {
      throw AppError.badRequest(
        'L’elenco contiene valori non validi.'
      );
    }

    return [...new Set(
      value.map((item: string) => item.trim())
    )];
  }

  private static validateImageUrls(images: string[]): string[] {
    for (const image of images) {
      try {
        const url = new URL(image);

        if (
          url.protocol !== 'https:' &&
          url.protocol !== 'http:'
        ) {
          throw new Error('Protocollo non valido');
        }
      } catch {
        throw AppError.badRequest(
          'Inserisci soltanto URL di immagini validi.'
        );
      }
    }

    return images;
  }

  /**
   * GET /api/board
   * Recupera gli annunci pubblici attivi.
   */
  static async getAll() {
    return prisma.boardPost.findMany({
      where: {
        status: 'active',
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } }
        ]
      },
      orderBy: [
        { bumped_at: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: {
          select: {
            username: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Recupera un annuncio tramite UUID.
   */
  static async getById(id: string) {
    this.validateUUID(id);

    const post = await prisma.boardPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            username: true,
            role: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!post) {
      throw AppError.notFound(
        'Annuncio non trovato.'
      );
    }

    return post;
  }

  /**
   * Crea un nuovo annuncio.
   */
  static async create(data: any, authorId: string) {
    this.validateUUID(authorId);

    const title = this.validateText(
      data?.title,
      'Titolo',
      5,
      150
    );

    const content = this.validateText(
      data?.content,
      'Descrizione',
      10,
      5000
    );

    const category = data?.category;

    if (
      typeof category !== 'string' ||
      !this.VALID_CATEGORIES.includes(category)
    ) {
      throw AppError.badRequest(
        'Categoria annuncio non valida.'
      );
    }

    const type =
      typeof data?.type === 'string' &&
      this.VALID_TYPES.includes(data.type)
        ? data.type
        : 'OFFRO';

    // FIX TS2322: prezzo esplicitamente number | null
    const price: number | null =
      this.parsePrice(data?.price);

    const tags =
      data?.tags === undefined
        ? []
        : this.parseStringArray(data.tags, 10)
            .map(tag => tag.toLowerCase());

    let images: string[] = [];

    if (data?.images !== undefined) {
      images = this.parseStringArray(data.images, 10);
    } else if (
      typeof data?.imageUrl === 'string' &&
      data.imageUrl.trim()
    ) {
      images = [data.imageUrl.trim()];
    }

    images = this.validateImageUrls(images);

    const city =
      data?.city === undefined ||
      data?.city === null ||
      data.city === ''
        ? null
        : this.validateText(data.city, 'Città', 2, 100);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    return prisma.boardPost.create({
      data: {
        title,
        content,
        category,
        type,
        tags,
        price,
        city,
        images,
        expires_at: expiresAt,
        status: 'active',
        authorId
      }
    });
  }

  /**
   * Modifica un annuncio.
   * Soltanto l'autore può modificarlo.
   */
  static async update(
    id: string,
    data: any,
    userId: string
  ) {
    this.validateUUID(id);
    this.validateUUID(userId);

    const post = await prisma.boardPost.findUnique({
      where: { id }
    });

    if (!post) {
      throw AppError.notFound(
        'Annuncio non trovato.'
      );
    }

    if (post.authorId !== userId) {
      throw AppError.forbidden(
        'Non puoi modificare un annuncio che non è tuo.'
      );
    }

    const title =
      data?.title !== undefined
        ? this.validateText(data.title, 'Titolo', 5, 150)
        : post.title;

    const content =
      data?.content !== undefined
        ? this.validateText(
            data.content,
            'Descrizione',
            10,
            5000
          )
        : post.content;

    const category = data?.category ?? post.category;

    if (!this.VALID_CATEGORIES.includes(category)) {
      throw AppError.badRequest(
        'Categoria non valida.'
      );
    }

    const type = data?.type ?? post.type;

    if (
      typeof type !== 'string' ||
      !this.VALID_TYPES.includes(type)
    ) {
      throw AppError.badRequest(
        'Tipo annuncio non valido.'
      );
    }

    const price =
      data?.price !== undefined
        ? this.parsePrice(data.price)
        : post.price;

    const tags =
      data?.tags !== undefined
        ? this.parseStringArray(data.tags, 10)
            .map(tag => tag.toLowerCase())
        : post.tags;

    let images = post.images;

    if (data?.images !== undefined) {
      images = this.validateImageUrls(
        this.parseStringArray(data.images, 10)
      );
    } else if (data?.imageUrl !== undefined) {
      images =
        typeof data.imageUrl === 'string' &&
        data.imageUrl.trim()
          ? this.validateImageUrls(
              [data.imageUrl.trim()]
            )
          : [];
    }

    const city =
      data?.city === undefined
        ? post.city
        : data.city === null || data.city === ''
          ? null
          : this.validateText(data.city, 'Città', 2, 100);

    return prisma.boardPost.update({
      where: { id },
      data: {
        title,
        content,
        category,
        type,
        tags,
        price,
        city,
        images
      }
    });
  }

  /**
   * Elimina un annuncio.
   *
   * Autore o moderatore autorizzato.
   * Il ruolo viene letto dal database.
   */
  static async delete(
    id: string,
    userId: string,
    _userRole: string = 'USER'
  ) {
    this.validateUUID(id);
    this.validateUUID(userId);

    const [post, profile] = await Promise.all([
      prisma.boardPost.findUnique({
        where: { id }
      }),
      prisma.profile.findUnique({
        where: { id: userId },
        select: {
          role: true,
          isActive: true
        }
      })
    ]);

    if (!post) {
      throw AppError.notFound(
        'Annuncio non trovato.'
      );
    }

    if (!profile?.isActive) {
      throw AppError.forbidden(
        'Utente non autorizzato.'
      );
    }

    const isAdmin = [
      'ADMIN',
      'SUPER_ADMIN',
      'MODERATOR'
    ].includes(profile.role);

    if (post.authorId !== userId && !isAdmin) {
      throw AppError.forbidden(
        'Non puoi eliminare un annuncio che non è tuo.'
      );
    }

    return prisma.boardPost.delete({
      where: { id }
    });
  }

  /**
   * Incrementa il contatore visualizzazioni.
   */
  static async incrementView(id: string) {
    this.validateUUID(id);

    return prisma.boardPost.update({
      where: { id },
      data: {
        view_count: {
          increment: 1
        }
      }
    });
  }

  /**
   * Aggiunge o rimuove un annuncio dai preferiti.
   */
  static async toggleSave(
    postId: string,
    userId: string
  ) {
    this.validateUUID(postId);
    this.validateUUID(userId);

    const post = await prisma.boardPost.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      throw AppError.notFound(
        'Annuncio non trovato.'
      );
    }

    const existing =
      await prisma.saved_board_posts.findUnique({
        where: {
          user_id_board_post_id: {
            user_id: userId,
            board_post_id: postId
          }
        }
      });

    if (existing) {
      await prisma.saved_board_posts.delete({
        where: { id: existing.id }
      });

      return {
        saved: false,
        message: 'Rimosso dai preferiti'
      };
    }

    await prisma.saved_board_posts.create({
      data: {
        user_id: userId,
        board_post_id: postId
      }
    });

    return {
      saved: true,
      message: 'Salvato nei preferiti!'
    };
  }

  /**
   * Recupera gli annunci salvati dall'utente.
   */
  static async getSavedPosts(userId: string) {
    this.validateUUID(userId);

    return prisma.saved_board_posts.findMany({
      where: {
        user_id: userId
      },
      include: {
        board_posts: {
          include: {
            author: {
              select: {
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  /**
   * Riporta un annuncio in cima alla bacheca.
   *
   * Costo: 20 Mbare Coin.
   */
  static async bumpPost(
    id: string,
    userId: string
  ) {
    this.validateUUID(id);
    this.validateUUID(userId);

    const post = await prisma.boardPost.findUnique({
      where: { id }
    });

    if (!post) {
      throw AppError.notFound(
        'Annuncio non trovato.'
      );
    }

    if (post.authorId !== userId) {
      throw AppError.forbidden(
        'Non puoi bumpare un annuncio che non è tuo.'
      );
    }

    if (post.status !== 'active') {
      throw AppError.badRequest(
        'Puoi mettere in evidenza soltanto annunci attivi.'
      );
    }

    if (
      post.expires_at &&
      post.expires_at <= new Date()
    ) {
      throw AppError.badRequest(
        'Non puoi mettere in evidenza un annuncio scaduto.'
      );
    }

    const COST = 20;

    await TokenService.spendTokens(
      userId,
      COST,
      `Bump annuncio: ${post.title}`
    );

    return prisma.boardPost.update({
      where: { id },
      data: {
        bumped_at: new Date()
      }
    });
  }

  /**
   * Avvia o recupera la conversazione
   * relativa a un annuncio.
   */
  static async startConversation(
    postId: string,
    userId: string
  ) {
    this.validateUUID(postId);
    this.validateUUID(userId);

    const post = await prisma.boardPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw AppError.notFound(
        'Annuncio non trovato.'
      );
    }

    if (post.authorId === userId) {
      throw AppError.badRequest(
        'Non puoi contattare te stesso!'
      );
    }

    if (!post.authorId) {
      throw AppError.badRequest(
        "L'autore dell'annuncio non è disponibile."
      );
    }

    if (post.status !== 'active') {
      throw AppError.badRequest(
        'Questo annuncio non è più attivo.'
      );
    }

    const authorId = post.authorId;

    // Cerca una conversazione tra questi utenti.
    const existing = await prisma.conversation.findFirst({
      where: {
        contextType: 'BOARD_POST',
        contextId: postId,
        isActive: true,
        conversation_participants: {
          every: {
            user_id: {
              in: [userId, authorId]
            }
          }
        },
        AND: [
          {
            conversation_participants: {
              some: { user_id: userId }
            }
          },
          {
            conversation_participants: {
              some: { user_id: authorId }
            }
          }
        ]
      }
    });

    if (existing) {
      return existing.id;
    }

    // Crea la conversazione e i partecipanti.
    const newConversation =
      await prisma.conversation.create({
        data: {
          contextType: 'BOARD_POST',
          contextId: postId,
          isActive: true,
          conversation_participants: {
            create: [
              { user_id: userId },
              { user_id: authorId }
            ]
          }
        }
      });

    return newConversation.id;
  }
}
