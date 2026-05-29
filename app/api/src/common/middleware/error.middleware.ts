import { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: 'Internal server error' });
};
