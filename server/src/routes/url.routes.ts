import { Router } from 'express';
import { UrlController } from '../controllers/url.controller';

const router = Router();

import { authenticate } from '../middleware/auth.middleware';

router.post('/shorten', authenticate, UrlController.shorten);
router.delete('/:shortCode', authenticate, UrlController.deleteUrl);
// router.get('/:shortCode', UrlController.redirect); // Moved to app.ts

export default router;
