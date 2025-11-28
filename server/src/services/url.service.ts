import prisma from '../prisma/client';
import { generateShortCode } from '../utils/random';

export class UrlService {
    static async shortenUrl(originalUrl: string, userId?: number) {
        let shortCode = generateShortCode();
        let exists = await prisma.url.findUnique({ where: { shortCode } });

        // Simple collision check (retry once or loop)
        while (exists) {
            shortCode = generateShortCode();
            exists = await prisma.url.findUnique({ where: { shortCode } });
        }

        return await prisma.url.create({
            data: {
                originalUrl,
                shortCode,
                userId: userId || null,
            },
        });
    }

    static async getOriginalUrl(shortCode: string) {
        return await prisma.url.findUnique({
            where: { shortCode },
        });
    }

    static async getUrlStats(shortCode: string) {
        return await prisma.url.findUnique({
            where: { shortCode },
            include: {
                _count: {
                    select: { visits: true }
                }
            }
        })
    }

    static async getUserUrls(userId: number) {
        return await prisma.url.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { visits: true }
                }
            }
        });
    }
    static async getUrlByShortCode(shortCode: string) {
        return await prisma.url.findUnique({
            where: { shortCode },
        });
    }

    static async deleteUrl(id: number) {
        return await prisma.url.delete({
            where: { id },
        });
    }
}
