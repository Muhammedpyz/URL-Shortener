import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticate, requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to identify the user
router.get('/:shortCode', authenticate, requireAuth, StatsController.getUrlStats);

export default router;
