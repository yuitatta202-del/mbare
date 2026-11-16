import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';

export class ChatService {
  /**
   * Trova o crea una conversazione per un dato contesto (es. EVENT, GROUP, PALIO, GENERAL).
   */
  static async getOrCreateConversation(contextType: string, contextId: string) {
    if (!contextType || !contextId) {
      throw AppError.badRequest('Tipo e ID contesto sono obbligatori, minchia!');
    }

    // Cerca una conversazione esistente per quel contesto
    let conversation = await prisma.conversation.findFirst({
      where: { 
        contextType, 
        contextId 
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { username: true, avatarUrl: true } } },
          take: 50,
        }
      }
    });

    // Se non esiste, la crea
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { 
          contextType, 
          contextId, 
          isActive: true 
        },
        include: {
          messages: true
        }
      });
    }

    return conversation;
  }

  /**
   * Invia un messaggio in una conversazione.
   */
  static async sendMessage(conversationId: string, senderId: string, content: string) {
    if (!content || content.trim().length === 0) {
      throw AppError.badRequest('Scrivi quarchi cosa, non mannari messaggi vuioti!');
    }

    if (content.length > 1000) {
      throw AppError.badRequest('Minchia, è troppo lungo! Massimo 1000 caratteri.');
    }

    // Verifica che la conversazione esista
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      throw AppError.notFound('Conversazione non trovata. Forse l\'hannu manciata?');
    }

    // Crea il messaggio
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
      },
      include: {
        sender: { select: { username: true, avatarUrl: true } }
      }
    });

    // Aggiorna l'ultimo messaggio nella conversazione
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { 
        lastMessageId: message.id,
        updatedAt: new Date()
      }
    });

    return message;
  }

  /**
   * Recupera tutti i messaggi di una conversazione (con paginazione).
   */
  static async getMessages(conversationId: string, limit: number = 50, offset: number = 0) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        sender: { select: { username: true, avatarUrl: true } }
      }
    });

    // Inverti l'ordine per mostrare i più vecchi in alto
    return messages.reverse();
  }

  /**
   * Recupera tutte le conversazioni visibili all'utente.
   * Include le chat a cui partecipa E la chat generale (pubblica).
   */
  static async getUserConversations(userId: string) {
    return await prisma.conversation.findMany({
      where: {
        OR: [
          { participants: { some: { id: userId } } }, // Chat a cui partecipa
          { contextType: 'GENERAL' } // Chat generale visibile a tutti
        ]
      },
      include: {
        lastMessage: {
          include: { sender: { select: { username: true } } }
        },
        _count: { select: { messages: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Aggiunge un partecipante a una conversazione.
   */
  static async addParticipant(conversationId: string, userId: string) {
    return await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        participants: {
          connect: { id: userId }
        }
      }
    });
  }
}