import { Router } from 'express';
import { TokenController } from '../controllers/token.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Tutte le rotte dei token richiedono l'autenticazione
router.use(authenticate);

// Leggi il portafoglio
router.get('/wallet', TokenController.getMyWallet);

// Riscatta premio Arcade
router.post('/arcade/claim', TokenController.claimArcadeReward);

// Spendi token
router.post('/spend', TokenController.spend);

export default router;