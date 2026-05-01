import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import roleMiddleware from '../middleware/role.middleware.js';
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

/**
 * @openapi
 * /api/user/register:
 *   post:
 *     tags: [Users]
 *     summary: Registrar usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: ana@bildyapp.test }
 *               password: { type: string, example: password123 }
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email duplicado
 */
router.post('/register', validate(registerSchema), registerUser);
/**
 * @openapi
 * /api/user/register:
 *   put:
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     summary: Completar datos personales
 *     responses:
 *       200:
 *         description: Datos personales actualizados
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/register', authMiddleware, validate(personalDataSchema), updatePersonalData);
/**
 * @openapi
 * /api/user/validation:
 *   put:
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     summary: Validar email con codigo
 *     responses:
 *       200:
 *         description: Email validado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put('/validation', authMiddleware, validate(validationSchema), validateEmail);
/**
 * @openapi
 * /api/user/login:
 *   post:
 *     tags: [Users]
 *     summary: Login de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: ana@bildyapp.test }
 *               password: { type: string, example: password123 }
 *     responses:
 *       200:
 *         description: Token JWT emitido
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/login', validate(loginSchema), loginUser);
/**
 * @openapi
 * /api/user/refresh:
 *   post:
 *     tags: [Users]
 *     summary: Renovar access token
 *     responses:
 *       200:
 *         description: Nuevo access token
 */
router.post('/refresh', validate(refreshSchema), refreshSession);
/**
 * @openapi
 * /api/user/logout:
 *   post:
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     summary: Cerrar sesion
 *     responses:
 *       200:
 *         description: Sesion cerrada
 */
router.post('/logout', authMiddleware, logoutUser);
/**
 * @openapi
 * /api/user/company:
 *   patch:
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     summary: Crear o asociar compania
 *     responses:
 *       200:
 *         description: Compania asociada al usuario
 */
router.patch('/company', authMiddleware, validate(companySchema), updateCompany);
/**
 * @openapi
 * /api/user:
 *   get:
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener usuario autenticado
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *   delete:
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     summary: Eliminar usuario
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.get('/', authMiddleware, getUser);
router.delete('/', authMiddleware, validate(deleteUserSchema), deleteUser);
/**
 * @openapi
 * /api/user/password:
 *   put:
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     summary: Cambiar contrasena
 *     responses:
 *       200:
 *         description: Contrasena actualizada
 */
router.put('/password', authMiddleware, validate(passwordSchema), changePassword);
/**
 * @openapi
 * /api/user/invite:
 *   post:
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     summary: Invitar usuario guest a la compania
 *     responses:
 *       201:
 *         description: Usuario invitado
 *       403:
 *         description: Rol insuficiente
 */
router.post('/invite', authMiddleware, roleMiddleware(['admin']), validate(inviteSchema), inviteUser);

export default router;
