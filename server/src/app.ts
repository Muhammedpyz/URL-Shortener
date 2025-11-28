import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

import urlRoutes from './routes/url.routes';
import authRoutes from './routes/auth.routes';
import statsRoutes from './routes/stats.routes';
import userRoutes from './routes/user.routes';
import { UrlController } from './controllers/url.controller';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);

// Redirect route (Must be at root)
app.get('/:shortCode', UrlController.redirect);

app.get('/', (req: Request, res: Response) => {
    res.send('URL Shortener API is running!');
});

import { globalErrorHandler } from './middleware/error.middleware';
app.use(globalErrorHandler);

import { DatabaseService } from './services/db.service';

// Start Server only if not running on Vercel
if (require.main === module) {
    const startServer = async () => {
        await DatabaseService.init();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    };

    startServer();
}

export default app;
