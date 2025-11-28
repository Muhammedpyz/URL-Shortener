import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    console.error('💥 ERROR 💥', err);

    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err.message
        });
    }

    // Programming or other unknown error: don't leak error details
    // But try to recover if possible (e.g. database connection issues)
    if (err.code === 'P1001' || err.message.includes('Can\'t reach database')) {
        console.error('Database connection lost. Attempting to reconnect...');
        // In a serverless env, we can't really "reconnect" the process, 
        // but we can return a 503 Service Unavailable so the client can retry.
        return res.status(503).json({
            error: 'Database connection failed. Please try again shortly.'
        });
    }

    return res.status(500).json({
        error: 'Something went wrong!'
    });
};
