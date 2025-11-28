import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { User } from '@prisma/client';
import { EmailService } from './email.service';
import { generateShortCode } from '../utils/random'; // Reusing for random code

export class AuthService {
    static async register(email: string, username: string, password: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateShortCode().substring(0, 6).toUpperCase(); // 6 char code

        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                verificationCode,
                isVerified: false
            },
        });

        await EmailService.sendVerificationEmail(email, verificationCode);
        return user;
    }

    static async verifyEmail(email: string, code: string): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.verificationCode !== code) return false;

        await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, verificationCode: null }
        });

        return true;
    }

    static async login(email: string, password: string): Promise<string | null> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // Optional: Check isVerified here if you want to enforce it before login
        // if (!user.isVerified) throw new Error('Email not verified');

        const secret = process.env.JWT_SECRET || 'secret';
        return jwt.sign({ id: user.id, email: user.email, username: user.username }, secret, { expiresIn: '365d' });
    }

    static async initiateDeletion(userId: number, password: string): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return false;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return false;

        const deletionCode = generateShortCode().substring(0, 6).toUpperCase();
        await prisma.user.update({
            where: { id: userId },
            data: { verificationCode: deletionCode }
        });

        await EmailService.sendDeletionConfirmation(user.email, deletionCode);
        return true;
    }

    static async confirmDeletion(userId: number, code: string): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.verificationCode !== code) return false;

        // Delete all URLs first (cascade might handle this but explicit is safer)
        // Delete all Analytics first (referencing Urls)
        // We need to find all URLs for this user first to delete their analytics
        const userUrls = await prisma.url.findMany({ where: { userId }, select: { id: true } });
        const urlIds = userUrls.map(u => u.id);

        if (urlIds.length > 0) {
            await prisma.analytics.deleteMany({ where: { urlId: { in: urlIds } } });
        }

        // Then delete URLs
        await prisma.url.deleteMany({ where: { userId } });

        await prisma.user.delete({ where: { id: userId } });
        return true;
    }
}
