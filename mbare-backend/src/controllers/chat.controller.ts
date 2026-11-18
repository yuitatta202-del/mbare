
import type {
  Request,
  Response,
  NextFunction
} from 'express';

import { ChatService } from '../services/chat.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class ChatController {

  /**
   * GET /api/chat/conversation/:contextType/:contextId
   *
   * Recupera una conversazione esistente
   * oppure ne crea una nuova.
   */
  static async getConversation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {

      const contextType = req.params.contextType;
      const contextId = req.params.contextId;

      const userId = req.user?.sub;

      // Validazione parametri URL
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

      // Controllo autenticazione
      if (!userId) {
        throw AppError.badRequest(
          'Devi essere autenticato per accedere alla chat.'
        );
      }

      // Recupera o crea conversazione
      const conversation =
        await ChatService.getOrCreateConversation(
          contextType.trim(),
          contextId.trim()
        );

      // FIX TS18047: gestisce il possibile null
      if (!conversation) {
        throw AppError.notFound(
          'Impossibile trovare o creare la conversazione.'
        );
      }

      // Aggiunge l'utente alla conversazione
      await ChatService.addParticipant(
        conversation.id,
        userId
      );

      return res.status(200).json(conversation);

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/chat/conversation/:conversationId/messages
   *
   * Invia un messaggio.
   */
  static async sendMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {

      const conversationId = req.params.conversationId;
      const userId = req.user?.sub;

      // Validazione ID conversazione
      if (
        typeof conversationId !== 'string' ||
        !conversationId.trim()
      ) {
        throw AppError.badRequest(
          'ID conversazione non valido.'
        );
      }

      // Verifica autenticazione
      if (!userId) {
        throw AppError.badRequest(
          'Devi essere autenticato per inviare messaggi.'
        );
      }

      const { content } = req.body ?? {};

      // Validazione messaggio
      if (
        typeof content !== 'string' ||
        content.trim().length === 0
      ) {
        throw AppError.badRequest(
          'Scrivi quarchi cosa, non mannari messaggi vuioti!'
        );
      }

      const cleanContent = content.trim();

      // Limite per evitare messaggi eccessivamente lunghi
      if (cleanContent.length > 5000) {
        throw AppError.badRequest(
          'Il messaggio non può superare 5000 caratteri.'
        );
      }

      // Invio messaggio
      const message = await ChatService.sendMessage(
        conversationId,
        userId,
        cleanContent
      );

      return res.status(201).json(message);

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chat/conversation/:conversationId/messages
   *
   * Recupera i messaggi con paginazione.
   */
  static async getMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {

      const conversationId = req.params.conversationId;

      if (
        typeof conversationId !== 'string' ||
        !conversationId.trim()
      ) {
        throw AppError.badRequest(
          'ID conversazione non valido.'
        );
      }

      // Valori di default
      const rawLimit = req.query.limit;
      const rawOffset = req.query.offset;

      let limit = 50;
      let offset = 0;

      // Validazione limit
      if (rawLimit !== undefined) {
        if (
          typeof rawLimit !== 'string' ||
          !/^\d+$/.test(rawLimit)
        ) {
          throw AppError.badRequest(
            'Il parametro limit deve essere un numero intero.'
          );
        }

        limit = Number(rawLimit);
      }

      // Validazione offset
      if (rawOffset !== undefined) {
        if (
          typeof rawOffset !== 'string' ||
          !/^\d+$/.test(rawOffset)
        ) {
          throw AppError.badRequest(
            'Il parametro offset deve essere un numero intero.'
          );
        }

        offset = Number(rawOffset);
      }

      // Controllo intervalli e numeri sicuri
      if (
        !Number.isSafeInteger(limit) ||
        limit < 1 ||
        limit > 100
      ) {
        throw AppError.badRequest(
          'Il parametro limit deve essere tra 1 e 100.'
        );
      }

      if (
        !Number.isSafeInteger(offset) ||
        offset < 0
      ) {
        throw AppError.badRequest(
          'Il parametro offset non è valido.'
        );
      }

      // Recupera messaggi
      const messages = await ChatService.getMessages(
        conversationId,
        limit,
        offset
      );

      return res.status(200).json(messages);

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chat/conversations/me
   *
   * Recupera tutte le conversazioni
   * dell'utente autenticato.
   */
  static async getMyConversations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {

      const userId = req.user?.sub;

      if (!userId) {
        throw AppError.badRequest(
          'Devi essere autenticato per visualizzare le chat.'
        );
      }

      const conversations =
        await ChatService.getUserConversations(userId);

      return res.status(200).json(conversations);

    } catch (error) {
      next(error);
    }
  }
}
