
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

export class ChatService {

  private static readonly MAX_MESSAGE_LENGTH = 5000;
  private static readonly DEFAULT_LIMIT = 50;
  private static readonly MAX_LIMIT = 100;

  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  /**
   * Valida gli identificativi UUID.
   */
  private static validateUUID(
    value: string,
    field: string = 'ID'
  ): void {
    if (
      typeof value !== 'string' ||
      !this.UUID_REGEX.test(value)
    ) {
      throw AppError.badRequest(`${field} non valido.`);
    }
  }

  /**
   * Verifica l'appartenenza a una conversazione.
   */
  private static async isParticipant(
    conversationId: string,
    userId: string
  ): Promise<boolean> {

    const participant =
      await prisma.conversation_participants.findUnique({
        where: {
          conversation_id_user_id: {
            conversation_id: conversationId,
            user_id: userId
          }
        },
        select: {
          user_id: true
        }
      });

    return participant !== null;
  }

  /**
   * GET /api/chat/conversation/:contextType/:contextId
   *
   * Recupera o crea una conversazione.
   */
  static async getOrCreateConversation(
    contextType: string,
    contextId: string
  ) {

    if (
      typeof contextType !== 'string' ||
      !contextType.trim() ||
      typeof contextId !== 'string' ||
      !contextId.trim()
    ) {
      throw AppError.badRequest(
        'Tipo e ID contesto sono obbligatori, minchia!'
      );
    }

    const cleanContextType = contextType.trim().toUpperCase();
    const cleanContextId = contextId.trim();

    if (
      cleanContextType.length > 50 ||
      cleanContextId.length > 255
    ) {
      throw AppError.badRequest(
        'Contesto conversazione non valido.'
      );
    }

    // Le chat private degli annunci sono gestite
    // da BoardService.startConversation().
    if (cleanContextType === 'BOARD_POST') {
      throw AppError.forbidden(
        'Le chat private degli annunci devono essere avviate dalla bacheca.'
      );
    }

    // Cerca una conversazione esistente.
    const existing = await prisma.conversation.findFirst({
      where: {
        contextType: cleanContextType,
        contextId: cleanContextId,
        isActive: true
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: this.DEFAULT_LIMIT,
          include: {
            sender: {
              select: {
                username: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (existing) {
      return {
        ...existing,
        messages: existing.messages.reverse()
      };
    }

    // Crea una nuova conversazione.
    // FIX TS2322: usa lo stesso include
    // della query findFirst().
    const created = await prisma.conversation.create({
      data: {
        contextType: cleanContextType,
        contextId: cleanContextId,
        isActive: true
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: this.DEFAULT_LIMIT,
          include: {
            sender: {
              select: {
                username: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    return created;
  }

  /**
   * POST /api/chat/conversation/:conversationId/messages
   *
   * Invia un messaggio.
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ) {

    this.validateUUID(
      conversationId,
      'ID conversazione'
    );

    this.validateUUID(
      senderId,
      'ID mittente'
    );

    if (
      typeof content !== 'string' ||
      !content.trim()
    ) {
      throw AppError.badRequest(
        'Scrivi quarchi cosa, non mannari messaggi vuioti!'
      );
    }

    const cleanContent = content.trim();

    if (cleanContent.length > this.MAX_MESSAGE_LENGTH) {
      throw AppError.badRequest(
        'Il messaggio non può superare 5000 caratteri.'
      );
    }

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId
        },
        select: {
          id: true,
          isActive: true,
          contextType: true
        }
      });

    if (!conversation) {
      throw AppError.notFound(
        'Conversazione non trovata.'
      );
    }

    if (!conversation.isActive) {
      throw AppError.forbidden(
        'Questa conversazione è stata disattivata.'
      );
    }

    // Chat generale accessibile agli utenti autenticati.
    // Le altre richiedono l'iscrizione alla conversazione.
    if (conversation.contextType !== 'GENERAL') {
      const allowed = await this.isParticipant(
        conversationId,
        senderId
      );

      if (!allowed) {
        throw AppError.forbidden(
          'Non partecipi a questa conversazione.'
        );
      }
    }

    // Crea messaggio e aggiorna conversazione
    // nella stessa transazione.
    return prisma.$transaction(async tx => {

      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          content: cleanContent
        },
        include: {
          sender: {
            select: {
              username: true,
              avatarUrl: true
            }
          }
        }
      });

      await tx.conversation.update({
        where: {
          id: conversationId
        },
        data: {
          lastMessageId: message.id,
          updatedAt: new Date()
        }
      });

      return message;
    });
  }

  /**
   * GET /api/chat/conversation/:conversationId/messages
   *
   * Recupera i messaggi con paginazione.
   *
   * userId è richiesto per le chat private.
   */
  static async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
    userId?: string
  ) {

    this.validateUUID(
      conversationId,
      'ID conversazione'
    );

    if (
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > this.MAX_LIMIT
    ) {
      throw AppError.badRequest(
        'Limit deve essere compreso tra 1 e 100.'
      );
    }

    if (
      !Number.isSafeInteger(offset) ||
      offset < 0
    ) {
      throw AppError.badRequest(
        'Offset non valido.'
      );
    }

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId
        },
        select: {
          id: true,
          isActive: true,
          contextType: true
        }
      });

    if (!conversation) {
      throw AppError.notFound(
        'Conversazione non trovata.'
      );
    }

    if (!conversation.isActive) {
      throw AppError.forbidden(
        'Conversazione non disponibile.'
      );
    }

    // Tutte le chat private richiedono
    // autenticazione e appartenenza.
    if (conversation.contextType !== 'GENERAL') {

      if (!userId) {
        throw AppError.forbidden(
          'Devi autenticarti per leggere questa chat.'
        );
      }

      this.validateUUID(userId, 'ID utente');

      const allowed = await this.isParticipant(
        conversationId,
        userId
      );

      if (!allowed) {
        throw AppError.forbidden(
          'Non sei autorizzato a leggere questa conversazione.'
        );
      }
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: limit,
      skip: offset,
      include: {
        sender: {
          select: {
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    return messages.reverse();
  }

  /**
   * GET /api/chat/conversations/me
   *
   * Recupera le conversazioni dell'utente.
   */
  static async getUserConversations(userId: string) {

    this.validateUUID(userId, 'ID utente');

    const conversations =
      await prisma.conversation.findMany({
        where: {
          isActive: true,
          OR: [
            {
              conversation_participants: {
                some: {
                  user_id: userId
                }
              }
            },
            {
              contextType: 'GENERAL'
            }
          ]
        },
        include: {
          conversation_participants: {
            select: {
              user_id: true
            }
          },
          messages: {
            take: 1,
            orderBy: [
              { createdAt: 'desc' },
              { id: 'desc' }
            ],
            include: {
              sender: {
                select: {
                  username: true,
                  avatarUrl: true
                }
              }
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

    // Mantiene la proprietà lastMessage
    // per la compatibilità con il frontend.
    return conversations.map(conversation => {
      const { messages, ...rest } = conversation;

      return {
        ...rest,
        lastMessage: messages[0] ?? null
      };
    });
  }

  /**
   * Aggiunge un partecipante alla conversazione.
   *
   * Evita gli inserimenti duplicati.
   */
  static async addParticipant(
    conversationId: string,
    userId: string
  ) {

    this.validateUUID(
      conversationId,
      'ID conversazione'
    );

    this.validateUUID(
      userId,
      'ID utente'
    );

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId
        },
        select: {
          id: true,
          isActive: true,
          contextType: true
        }
      });

    if (!conversation) {
      throw AppError.notFound(
        'Conversazione non trovata.'
      );
    }

    if (!conversation.isActive) {
      throw AppError.forbidden(
        'Conversazione non attiva.'
      );
    }

    if (conversation.contextType === 'BOARD_POST') {
      throw AppError.forbidden(
        'Non puoi unirti direttamente a una chat privata.'
      );
    }

    return prisma.conversation_participants.upsert({
      where: {
        conversation_id_user_id: {
          conversation_id: conversationId,
          user_id: userId
        }
      },
      update: {},
      create: {
        conversation_id: conversationId,
        user_id: userId
      }
    });
  }
}
