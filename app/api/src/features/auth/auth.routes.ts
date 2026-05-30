import { Router } from 'express';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { RegisterDto, LoginDto, AuthorizeDto } from './auth.dto';
import * as authController from './auth.controller';

const router = Router();

router.post('/register', validate(RegisterDto, 'body'), authController.register);
router.post('/authorize', validate(AuthorizeDto, 'body'), authController.authorize);
router.post('/login', validate(LoginDto, 'body'), authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
