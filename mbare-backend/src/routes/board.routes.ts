import { Router } from 'express';
import { BoardController } from '../controllers/board.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ==========================================
// ROTTE PUBBLICHE (tutti possono leggere gli annunci)
// ==========================================
router.get('/', BoardController.getAll);

// Incrementa le visualizzazioni (chiunque può farlo, anche i non loggati)
router.post('/:id/view', BoardController.incrementView);

// ==========================================
// ROTTE PROTETTE (richiedono autenticazione)
// ==========================================

// ATTENZIONE ALL'ORDINE: /user/saved deve stare prima di /:id per non essere confusa
router.get('/user/saved', authenticate, BoardController.getSaved);

// Crea un nuovo annuncio
router.post('/', authenticate, BoardController.create);

// Recupera un singolo annuncio (spostato dopo le rotte più specifiche)
router.get('/:id', BoardController.getOne);

// Modifica un annuncio (solo l'autore)
router.put('/:id', authenticate, BoardController.update);

// Elimina un annuncio (solo l'autore o admin)
router.delete('/:id', authenticate, BoardController.delete);

// Salva/Rimuovi dai preferiti
router.post('/:id/save', authenticate, BoardController.toggleSave);

// Spingi in cima (Bump)
router.post('/:id/bump', authenticate, BoardController.bump);

// 🔥 NUOVO: Avvia una conversazione chat legata all'annuncio (Contatta l'autore)
router.post('/:id/contact', authenticate, BoardController.contact);

export default router;