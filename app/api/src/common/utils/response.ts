import { Response } from 'express';

export function success<T>(res: Response, data: T, statusCode = 200) {
  res.status(statusCode).json({ success: true, data });
}
