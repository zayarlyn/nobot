import { Router } from 'express';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { CreatePostDto } from './contribute.dto';
import * as contributeController from './contribute.controller';

const router = Router();

router.post('/', requireAuth, validate(CreatePostDto, 'body'), contributeController.submitPost);
router.get('/pending', contributeController.getPendingPosts);
router.patch('/:id/approve', contributeController.approvePost);
router.delete('/:id', requireAuth, contributeController.deletePost);

export default router;
