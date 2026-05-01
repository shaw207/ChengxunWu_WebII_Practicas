import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  listArchivedProjects,
  listProjects,
  restoreProject,
  updateProject
} from '../controllers/project.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { archivedListSchema, idParamSchema, softDeleteQuerySchema } from '../validators/common.validator.js';
import { createProjectSchema, listProjectsSchema, updateProjectSchema } from '../validators/project.validator.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/project/archived:
 *   get:
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     summary: Listar proyectos archivados
 *     responses:
 *       200:
 *         description: Proyectos archivados
 */
router.get('/archived', validate(archivedListSchema), listArchivedProjects);
/**
 * @openapi
 * /api/project:
 *   post:
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     summary: Crear proyecto
 *     responses:
 *       201:
 *         description: Proyecto creado
 *   get:
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     summary: Listar proyectos
 *     parameters:
 *       - in: query
 *         name: client
 *         schema: { type: string }
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: -createdAt }
 *     responses:
 *       200:
 *         description: Proyectos paginados
 */
router.post('/', validate(createProjectSchema), createProject);
router.get('/', validate(listProjectsSchema), listProjects);
/**
 * @openapi
 * /api/project/{id}:
 *   get:
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *   put:
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     summary: Actualizar proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *   delete:
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     summary: Borrar proyecto soft o hard
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: soft
 *         schema: { type: boolean, default: true }
 *     responses:
 *       200:
 *         description: Proyecto archivado
 *       204:
 *         description: Proyecto eliminado definitivamente
 */
router.get('/:id', validate(idParamSchema), getProject);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', validate(idParamSchema.merge(softDeleteQuerySchema)), deleteProject);
/**
 * @openapi
 * /api/project/{id}/restore:
 *   patch:
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     summary: Restaurar proyecto archivado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Proyecto restaurado
 */
router.patch('/:id/restore', validate(idParamSchema), restoreProject);

export default router;
