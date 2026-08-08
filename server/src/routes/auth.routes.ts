import { Router } from 'express';
import { googleAuth, login, logout, refresh, register } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { googleAuthSchema, loginSchema, registerSchema } from '../validations/auth.validation';

const router = Router();

router.post('/google', validateBody(googleAuthSchema), googleAuth);
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
