import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Rotta generica per ottenere/creare commenti
router.get('/:targetType/:targetId', CommentController.getComments);
router.post('/:targetType/:targetId', authenticate, CommentController.create);

// Rotta per eliminare un commento specifico
router.delete('/:id', authenticate, CommentController.delete);

export default router;