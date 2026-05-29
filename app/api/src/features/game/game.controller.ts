import { Request, Response } from 'express';
import asyncHandler from '../../common/utils/asyncHandler';
import { success } from '../../common/utils/response';
import * as gameService from './game.service';

export const getPosts = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await gameService.getPosts();
  success(res, posts);
});

export const saveGame = asyncHandler(async (req: Request, res: Response) => {
  const game = await gameService.saveGame(req.user!.id, req.body);
  success(res, game, 201);
});
