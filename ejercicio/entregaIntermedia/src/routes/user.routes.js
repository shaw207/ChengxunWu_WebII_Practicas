import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { loginUser, registerUser, validateEmail } from '../controllers/user.controller.js';
import { loginSchema, registerSchema, validationSchema } from '../validators/user.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.put('/validation', authMiddleware, validate(validationSchema), validateEmail);
router.post('/login', validate(loginSchema), loginUser);

export default router;
