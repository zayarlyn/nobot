import { Router } from 'express';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth, requireVerified } from '../../common/middleware/auth.middleware';
import { CreateThreadDto, CreateCommentDto, VoteDto } from './discussion.dto';
import * as discussionController from './discussion.controller';

const router = Router();

router.get('/threads', discussionController.getThreads);
router.post('/threads', requireAuth, requireVerified, validate(CreateThreadDto, 'body'), discussionController.createThread);
router.get('/threads/:id', discussionController.getThread);
router.post('/threads/:id/comments', requireAuth, requireVerified, validate(CreateCommentDto, 'body'), discussionController.createComment);
router.post('/votes', requireAuth, validate(VoteDto, 'body'), discussionController.vote);

export default router;
