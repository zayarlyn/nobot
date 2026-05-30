import { Request, Response } from 'express';
import asyncHandler from '../../common/utils/asyncHandler';
import { success } from '../../common/utils/response';
import * as contributeService from './contribute.service';

export const submitPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await contributeService.submitPost(req.user!.id, req.body);
  success(res, post, 201);
});

export const getMyPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await contributeService.getMyPosts(req.user!.id);
  success(res, posts);
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await contributeService.deletePost(Number(req.params.id), req.user!.id);
  success(res, null, 204);
});
