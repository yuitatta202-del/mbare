import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Tutte queste rotte richiedono un utente loggato
router.post('/profile', authenticate, AuthController.createProfile);
router.get('/me', authenticate, AuthController.getMe);

export default router;