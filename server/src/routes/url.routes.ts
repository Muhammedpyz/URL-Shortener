import { Router } from 'express';
import { UrlController } from '../controllers/url.controller';

const router = Router();

import { authenticate } from '../middleware/auth.middleware';

router.post('/shorten', authenticate, UrlController.shorten);
router.get('/:shortCode', UrlController.redirect);
router.delete('/:shortCode', authenticate, UrlController.deleteUrl);
router.get('/debug', UrlController.testDebug); // Moved to app.ts

export default router;
