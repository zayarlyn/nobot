import { Request, Response } from 'express';
import asyncHandler from '../../common/utils/asyncHandler';
import { success } from '../../common/utils/response';
import * as discussionService from './discussion.service';

export const getThreads = asyncHandler(async (_req: Request, res: Response) => {
  const threads = await discussionService.getThreads();
  success(res, threads);
});

export const createThread = asyncHandler(async (req: Request, res: Response) => {
  const thread = await discussionService.createThread(req.user!.id, req.body);
  success(res, thread, 201);
});

export const getThread = asyncHandler(async (req: Request, res: Response) => {
  const thread = await discussionService.getThread(Number(req.params.id));
  success(res, thread);
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await discussionService.createComment(req.user!.id, Number(req.params.id), req.body);
  success(res, comment, 201);
});

export const vote = asyncHandler(async (req: Request, res: Response) => {
  const result = await discussionService.vote(req.user!.id, req.body);
  success(res, result);
});
