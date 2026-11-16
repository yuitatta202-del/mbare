import type { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class ChatController {
  /**
   * GET /api/chat/:contextType/:contextId
   * Recupera o crea una conversazione per un contesto specifico (es. EVENT, GROUP, PALIO).
   */
  static async getConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { contextType, contextId } = req.params;

      if (!contextType || !contextId) {
        throw AppError.badRequest('Tipo e ID contesto sono obbligatori, minchia!');
      }

      const conversation = await ChatService.getOrCreateConversation(contextType, contextId);

      // Aggiungi automaticamente l'utente come partecipante
      await ChatService.addParticipant(conversation.id, req.user.sub);

      res.json(conversation);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/chat/:conversationId/messages
   * Invia un messaggio in una conversazione.
   */
  static async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        throw AppError.badRequest('Scrivi quarchi cosa, non mannari messaggi vuioti!');
      }

      const message = await ChatService.sendMessage(conversationId, req.user.sub, content);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chat/:conversationId/messages
   * Recupera i messaggi di una conversazione (con paginazione).
   */
  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const messages = await ChatService.getMessages(conversationId, limit, offset);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chat/my-conversations
   * Recupera tutte le conversazioni dell'utente loggato (incluse quelle pubbliche come GENERAL).
   */
  static async getMyConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversations = await ChatService.getUserConversations(req.user.sub);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  }
}