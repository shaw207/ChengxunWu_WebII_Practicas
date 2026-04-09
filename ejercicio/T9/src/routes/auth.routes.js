import { Router } from 'express';
import { getMe, login, register } from '../controllers/auth.controller.js';
import { authRequired } from '../middleware/auth.middleware.js';
import {
  loginSchema,
  registerSchema,
  validateBody,
} from '../schemas/validation.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authRequired, getMe);

export default router;
