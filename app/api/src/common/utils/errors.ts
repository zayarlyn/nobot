export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (r: string) => new AppError(`${r} not found`, 404);
export const unauthorized = (msg = 'Unauthorized') => new AppError(msg, 401);
export const forbidden = () => new AppError('Forbidden', 403);
export const badRequest = (msg: string) => new AppError(msg, 400);
export const conflict = (msg: string) => new AppError(msg, 409);
