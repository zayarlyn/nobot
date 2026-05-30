import { Router } from 'express';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { CreateGameDto, DecisionDto } from './game.dto';
import * as gameController from './game.controller';

const router = Router();

router.get('/posts', gameController.getPosts);
router.post('/decisions', validate(DecisionDto, 'body'), gameController.decide);
router.post('/sessions', requireAuth, validate(CreateGameDto, 'body'), gameController.saveGame);

export default router;
