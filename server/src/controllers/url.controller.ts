import { Request, Response } from 'express';
import { z } from 'zod';
import { UrlService } from '../services/url.service';
import { AnalyticsService } from '../services/analytics.service';
import { EmailService } from '../services/email.service';
import prisma from '../prisma/client';

// Validation Schema
const shortenSchema = z.object({
    originalUrl: z.string().url({ message: "Invalid URL format" }),
});

export class UrlController {
    static async shorten(req: Request, res: Response) {
        try {
            const result = shortenSchema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({ error: result.error.issues[0].message });
            }

            const { originalUrl } = result.data;
            // Get userId from Auth middleware if logged in
            // req.user is populated by authenticate middleware (optional for this route?)
            // We need to make sure we check the token if it exists in the header, even if the route is public
            // But currently the route is public. We should probably parse the token manually if present
            // OR use a middleware that sets user if token is valid but doesn't block if not.

            // Assuming we will update the route to use 'authenticate' middleware optionally or check header here
            let userId = null;
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const token = authHeader.split(' ')[1];
                // We need to decode it. Since we don't want to duplicate logic, let's assume middleware handles it
                // But wait, the route definition in url.routes.ts doesn't have middleware.
                // We should add a middleware that populates user but doesn't require it.
                // For now, let's just try to get it from req.user if middleware was used.
                userId = (req as any).user?.id;
                console.log('Shortening URL. AuthHeader:', !!authHeader, 'UserId:', userId);
            }

            const url = await UrlService.shortenUrl(originalUrl, userId);

            // Construct full short URL
            // Priority: 1. Environment Variable, 2. Request Host (Dynamic)
            let baseUrl = process.env.BASE_URL;

            if (!baseUrl) {
                const protocol = req.protocol === 'http' ? 'http' : 'https'; // Basic check
                // In production (Vercel), we usually want https.
                // req.get('host') gives us the domain (e.g. url-shortener.vercel.app)
                const host = req.get('host');
                baseUrl = `${protocol}://${host}`;

                // Force HTTPS on Vercel if not detected
                if (host?.includes('vercel.app') && !baseUrl.startsWith('https')) {
                    baseUrl = `https://${host}`;
                }
            }

            const shortUrl = `${baseUrl}/${url.shortCode}`;

            res.status(201).json({
                originalUrl: url.originalUrl,
                shortCode: url.shortCode,
                shortUrl,
            });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error: ' + error.message });
        }
    }

    static async redirect(req: Request, res: Response) {
        try {
            const { shortCode } = req.params;
            const url = await UrlService.getOriginalUrl(shortCode);

            if (!url) {
                return res.status(404).json({ error: 'URL not found' });
            }

            // Log Visit (Fire and forget - don't await to speed up redirect)
            AnalyticsService.logVisit({
                urlId: url.id,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                referrer: req.headers['referer'],
            });

            return res.redirect(url.originalUrl);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async deleteUrl(req: Request, res: Response) {
        try {
            const { shortCode } = req.params;
            const userId = (req as any).user.id;

            const url = await UrlService.getUrlByShortCode(shortCode);
            if (!url) return res.status(404).json({ error: 'URL not found' });

            if (url.userId !== userId) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Delete analytics first (cascade should handle, but explicit is safer)
            await AnalyticsService.deleteStats(url.id);
            await UrlService.deleteUrl(url.id);

            res.json({ message: 'URL deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async testDebug(req: Request, res: Response) {
        try {
            // 1. Test DB Connection
            const userCount = await prisma.user.count();

            // 2. Test Email
            await EmailService.sendErrorLog(new Error('Test Error from Debug Endpoint'), 'Manual Debug Test');

            res.json({
                status: 'success',
                message: 'Debug test complete. Check your email.',
                dbConnection: 'OK',
                userCount,
                env: {
                    smtpUser: process.env.SMTP_USER ? 'Set' : 'Missing',
                    smtpPass: process.env.SMTP_PASS ? 'Set' : 'Missing',
                    dbUrl: process.env.DATABASE_URL ? 'Set' : 'Missing'
                }
            });
        } catch (error: any) {
            console.error('Debug Test Failed:', error);
            res.status(500).json({
                status: 'error',
                message: error.message,
                stack: error.stack
            });
        }
    }
}
