import { Request, Response } from 'express';
import asyncHandler from '../../common/utils/asyncHandler';
import { success } from '../../common/utils/response';
import { notFound } from '../../common/utils/errors';
import * as gameService from './game.service';

export const getPosts = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await gameService.getPosts();
  success(res, posts);
});

export const decide = asyncHandler(async (req: Request, res: Response) => {
  const result = await gameService.evaluateDecision(req.body.postId, req.body.action);
  if (!result) throw notFound('Post');
  success(res, result);
});

export const saveGame = asyncHandler(async (req: Request, res: Response) => {
  const game = await gameService.saveGame(req.user!.id, req.body);
  success(res, game, 201);
});
