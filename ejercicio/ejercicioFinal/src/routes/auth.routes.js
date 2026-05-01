import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { getUser, updatePersonalData } from '../controllers/user.controller.js';
import { personalDataSchema } from '../validators/user.validator.js';

const router = Router();

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener perfil autenticado
 *     responses:
 *       200:
 *         description: Perfil autenticado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   put:
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     summary: Actualizar perfil autenticado
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/me', authMiddleware, getUser);
router.put('/me', authMiddleware, validate(personalDataSchema), updatePersonalData);

export default router;
