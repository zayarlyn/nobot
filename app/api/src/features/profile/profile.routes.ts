import { Router } from 'express';
import * as profileController from './profile.controller';

const router = Router();

router.get('/leaderboard', profileController.getLeaderboard);
router.get('/:id', profileController.getProfile);

export default router;
