import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  changePassword,
  deleteUser,
  getUser,
  inviteUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  updateCompany,
  updatePersonalData,
  uploadCompanyLogo,
  validateEmail
} from '../controllers/user.controller.js';
import {
  companySchema,
  deleteUserSchema,
  inviteSchema,
  loginSchema,
  passwordSchema,
  personalDataSchema,
  refreshSchema,
  registerSchema,
  validationSchema
} from '../validators/user.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.put('/register', authMiddleware, validate(personalDataSchema), updatePersonalData);
router.put('/validation', authMiddleware, validate(validationSchema), validateEmail);
router.post('/login', validate(loginSchema), loginUser);
router.post('/refresh', validate(refreshSchema), refreshSession);
router.post('/logout', authMiddleware, logoutUser);
router.patch('/company', authMiddleware, validate(companySchema), updateCompany);
router.patch('/logo', authMiddleware, upload.single('logo'), uploadCompanyLogo);
router.get('/', authMiddleware, getUser);
router.delete('/', authMiddleware, validate(deleteUserSchema), deleteUser);
router.put('/password', authMiddleware, validate(passwordSchema), changePassword);
router.post('/invite', authMiddleware, roleMiddleware(['admin']), validate(inviteSchema), inviteUser);

export default router;
