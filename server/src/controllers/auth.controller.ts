import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import prisma from '../prisma/client';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const deleteInitSchema = z.object({
  password: z.string(),
});

const deleteConfirmSchema = z.object({
  code: z.string().length(6),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      const { email, username, password } = result.data;
      const user = await AuthService.register(email, username, password);

      // Şifreyi geri döndürme
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const result = verifySchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.format() });

      const success = await AuthService.verifyEmail(result.data.email, result.data.code);
      if (!success) return res.status(400).json({ error: 'Invalid code or email' });

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      const { email, password } = result.data;
      const token = await AuthService.login(email, password);

      if (!token) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get user info to send back
      const user = await prisma.user.findUnique({ where: { email } });
      const { password: _, verificationCode: __, ...userWithoutPassword } = user!;

      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async initiateDeletion(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = deleteInitSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.format() });

      const success = await AuthService.initiateDeletion(userId, result.data.password);
      if (!success) return res.status(401).json({ error: 'Invalid password' });

      res.json({ message: 'Confirmation code sent to your email' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async confirmDeletion(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = deleteConfirmSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.format() });

      const success = await AuthService.confirmDeletion(userId, result.data.code);
      if (!success) return res.status(400).json({ error: 'Invalid code' });

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
