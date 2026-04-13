import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  loginUser,
  registerUser,
  updateCompany,
  updatePersonalData,
  uploadCompanyLogo,
  validateEmail
} from '../controllers/user.controller.js';
import {
  companySchema,
  loginSchema,
  personalDataSchema,
  registerSchema,
  validationSchema
} from '../validators/user.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.put('/register', authMiddleware, validate(personalDataSchema), updatePersonalData);
router.put('/validation', authMiddleware, validate(validationSchema), validateEmail);
router.post('/login', validate(loginSchema), loginUser);
router.patch('/company', authMiddleware, validate(companySchema), updateCompany);
router.patch('/logo', authMiddleware, upload.single('logo'), uploadCompanyLogo);

export default router;
