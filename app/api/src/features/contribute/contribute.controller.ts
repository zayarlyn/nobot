import { Request, Response } from 'express';
import asyncHandler from '../../common/utils/asyncHandler';
import { success } from '../../common/utils/response';
import * as contributeService from './contribute.service';

export const submitPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await contributeService.submitPost(req.user!.id, req.body);
  success(res, post, 201);
});

export const getPendingPosts = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await contributeService.getPendingPosts();
  success(res, posts);
});

export const approvePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await contributeService.approvePost(Number(req.params.id));
  success(res, post);
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await contributeService.deletePost(Number(req.params.id), req.user!.id);
  success(res, null, 204);
});
