import { Router } from 'express';
import { GroupController } from '../controllers/group.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', GroupController.getAll);
router.post('/', authenticate, GroupController.create);
router.post('/:id/join', authenticate, GroupController.join);

export default router;