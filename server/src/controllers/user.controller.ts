import { Request, Response } from 'express';
import { UrlService } from '../services/url.service';

export class UserController {
    static async getMyUrls(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const urls = await UrlService.getUserUrls(userId);

            // Format response
            const formattedUrls = urls.map((url: any) => ({
                shortCode: url.shortCode,
                originalUrl: url.originalUrl,
                visits: (url as any)._count.visits,
                createdAt: url.createdAt
            }));

            res.json(formattedUrls);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
