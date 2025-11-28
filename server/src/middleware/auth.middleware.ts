import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
      if (err) {
        // If token is invalid, just proceed as guest (user will be undefined)
        // Or strictly forbid? For this app, we have guest mode, so maybe we just don't set req.user
        // But if the user sent a token, they probably expect it to work.
        // Let's just log it and move on, or return 403 if it was a protected route?
        // For now, let's just not set req.user if verification fails.
        return next(); 
      }

      req.user = user;
      next();
    });
  } else {
    next();
  }
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};
