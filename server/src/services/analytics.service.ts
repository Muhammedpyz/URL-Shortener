import prisma from '../prisma/client';
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

interface VisitData {
    urlId: number;
    ip?: string;
    userAgent?: string;
    referrer?: string;
}

export class AnalyticsService {
    static async logVisit(data: VisitData) {
        try {
            let country = null;
            let city = null;
            let browser = null;
            let os = null;
            let device = null;

            // GeoIP Lookup
            if (data.ip) {
                const geo = geoip.lookup(data.ip);
                if (geo) {
                    country = geo.country;
                    city = geo.city;
                }
            }

            // User-Agent Parsing
            if (data.userAgent) {
                const parser = new UAParser(data.userAgent);
                const result = parser.getResult();
                browser = result.browser.name ? `${result.browser.name} ${result.browser.version || ''}`.trim() : null;
                os = result.os.name ? `${result.os.name} ${result.os.version || ''}`.trim() : null;
                device = result.device.type || 'Desktop'; // Default to Desktop if undefined
            }

            await prisma.analytics.create({
                data: {
                    urlId: data.urlId,
                    ip: data.ip,
                    userAgent: data.userAgent,
                    referrer: data.referrer,
                    country,
                    city,
                    browser,
                    os,
                    device
                },
            });
        } catch (error) {
            console.error('Failed to log visit:', error);
        }
    }

    static async getUrlStats(urlId: number) {
        const totalVisits = await prisma.analytics.count({ where: { urlId } });
        const lastVisits = await prisma.analytics.findMany({
            where: { urlId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Increased limit
        });

        return { totalVisits, lastVisits };
    }
    static async deleteStats(urlId: number) {
        return await prisma.analytics.deleteMany({
            where: { urlId },
        });
    }
}
