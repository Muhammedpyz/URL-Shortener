import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/my-urls', authenticate, requireAuth, UserController.getMyUrls);

export default router;
