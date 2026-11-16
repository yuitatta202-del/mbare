import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Tutte le rotte chat richiedono autenticazione
router.use(authenticate);

// Recupera o crea una conversazione per un contesto
router.get('/:contextType/:contextId', ChatController.getConversation);

// Messaggi
router.post('/:conversationId/messages', ChatController.sendMessage);
router.get('/:conversationId/messages', ChatController.getMessages);

// Le mie conversazioni
router.get('/my-conversations', ChatController.getMyConversations);

export default router;