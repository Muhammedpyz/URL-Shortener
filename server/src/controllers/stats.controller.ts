import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import prisma from '../prisma/client';

export class StatsController {
    static async getUrlStats(req: Request, res: Response) {
        try {
            const { shortCode } = req.params;
            const userId = (req as any).user?.id;

            const url = await prisma.url.findUnique({
                where: { shortCode },
            });

            if (!url) {
                return res.status(404).json({ error: 'URL bulunamadı' });
            }

            // Check ownership if user is logged in, or if it's a public link?
            // For now, let's allow the owner to see detailed stats.
            // If guest mode, maybe show limited stats?
            // The requirement was: "Guests: Can shorten (No stats). Members: Can shorten + Detailed stats."

            if (url.userId && url.userId !== userId) {
                return res.status(403).json({ error: 'Bu istatistikleri görüntüleme yetkiniz yok.' });
            }

            if (!url.userId && !userId) {
                // Guest link, guest user. 
                // User requirement: "Misafirler: Hızlıca link kısaltabilir (İstatistik göremez)."
                return res.status(403).json({ error: 'İstatistikleri görmek için giriş yapmalısınız.' });
            }

            const stats = await AnalyticsService.getUrlStats(url.id);
            res.json(stats);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Sunucu hatası' });
        }
    }
}
