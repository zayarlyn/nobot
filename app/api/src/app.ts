import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from './common/middleware/error.middleware';
import authRoutes from './features/auth/auth.routes';
import gameRoutes from './features/game/game.routes';
import contributeRoutes from './features/contribute/contribute.routes';
import discussionRoutes from './features/discussion/discussion.routes';
import profileRoutes from './features/profile/profile.routes';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/contribute', contributeRoutes);
app.use('/api/discussion', discussionRoutes);
app.use('/api/profile', profileRoutes);

app.use(errorMiddleware);

export default app;
