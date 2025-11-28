import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify', AuthController.verifyEmail);

// Protected routes
router.post('/delete-account/initiate', authenticate, AuthController.initiateDeletion);
router.post('/delete-account/confirm', authenticate, AuthController.confirmDeletion);

export default router;
