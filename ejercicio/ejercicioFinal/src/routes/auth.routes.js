import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { getUser, updatePersonalData } from '../controllers/user.controller.js';
import { personalDataSchema } from '../validators/user.validator.js';

const router = Router();

router.get('/me', authMiddleware, getUser);
router.put('/me', authMiddleware, validate(personalDataSchema), updatePersonalData);

export default router;
