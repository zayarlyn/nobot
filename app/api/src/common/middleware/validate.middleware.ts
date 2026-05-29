import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { badRequest } from '../utils/errors';

export function validate(schema: ZodSchema, target: 'body' | 'query' | 'params') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const msg = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(badRequest(msg));
    }
    req[target] = result.data;
    next();
  };
}
