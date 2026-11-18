import type { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class ChatController {
  static async getConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const contextType = req.params.contextType as string;
      const contextId = req.params.contextId as string;

      if (!contextType || !contextId) {
        throw AppError.badRequest('Tipo e ID contesto sono obbligatori, minchia!');
      }

      const conversation = await ChatService.getOrCreateConversation(contextType, contextId);
      await ChatService.addParticipant(conversation.id, req.user.sub);

      res.json(conversation);
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.conversationId as string;
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

  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.conversationId as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const messages = await ChatService.getMessages(conversationId, limit, offset);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  static async getMyConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversations = await ChatService.getUserConversations(req.user.sub);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  }
}