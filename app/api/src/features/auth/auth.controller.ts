import { Request, Response } from 'express';
import asyncHandler from '../../common/utils/asyncHandler';
import { success } from '../../common/utils/response';
import * as authService from './auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body.username, req.body.password);
  success(res, user, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { token, user } = await authService.login(req.body.username, req.body.password);
  res.cookie('nobot_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  success(res, user);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('nobot_token');
  success(res, null);
});

export const authorize = asyncHandler(async (req: Request, res: Response) => {
  const { token, user } = await authService.authorize(req.body.username, req.body.password);
  res.cookie('nobot_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  success(res, user);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  success(res, req.user);
});
