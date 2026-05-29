import { Request, Response } from 'express';
import asyncHandler from '../../common/utils/asyncHandler';
import { success } from '../../common/utils/response';
import * as profileService from './profile.service';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await profileService.getProfile(Number(req.params.id));
  success(res, profile);
});

export const getLeaderboard = asyncHandler(async (_req: Request, res: Response) => {
  const leaderboard = await profileService.getLeaderboard();
  success(res, leaderboard);
});
