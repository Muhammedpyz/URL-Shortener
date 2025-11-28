import { Router } from 'express';
import { UrlController } from '../controllers/url.controller';

const router = Router();

import { authenticate } from '../middleware/auth.middleware';

router.post('/shorten', UrlController.shorten);
router.get('/debug', UrlController.testDebug); // New debug route
router.delete('/:shortCode', authenticate, UrlController.deleteUrl);
// router.get('/:shortCode', UrlController.redirect); // Moved to app.ts

export default router;
