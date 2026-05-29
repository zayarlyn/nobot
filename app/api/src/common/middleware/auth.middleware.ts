import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { unauthorized, forbidden } from '../utils/errors';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: number; username: string; isVerified: boolean };
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.nobot_token;
    if (!token) return next(unauthorized());
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, isVerified: true },
    });
    if (!user) return next(unauthorized());
    req.user = user;
    next();
  } catch {
    next(unauthorized());
  }
}

export function requireVerified(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.isVerified) return next(forbidden());
  next();
}
