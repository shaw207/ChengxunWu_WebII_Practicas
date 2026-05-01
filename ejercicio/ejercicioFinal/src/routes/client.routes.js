import { Router } from 'express';
import {
  createClient,
  deleteClient,
  getClient,
  listArchivedClients,
  listClients,
  restoreClient,
  updateClient
} from '../controllers/client.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { archivedListSchema, idParamSchema, softDeleteQuerySchema } from '../validators/common.validator.js';
import { createClientSchema, listClientsSchema, updateClientSchema } from '../validators/client.validator.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/client/archived:
 *   get:
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     summary: Listar clientes archivados
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Clientes archivados
 */
router.get('/archived', validate(archivedListSchema), listArchivedClients);
/**
 * @openapi
 * /api/client:
 *   post:
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     summary: Crear cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Cliente creado
 *       409:
 *         description: CIF duplicado en la compania
 *   get:
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     summary: Listar clientes
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: -createdAt }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, name, cif] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Clientes paginados
 */
router.post('/', validate(createClientSchema), createClient);
router.get('/', validate(listClientsSchema), listClients);
/**
 * @openapi
 * /api/client/{id}:
 *   get:
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     summary: Actualizar cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *   delete:
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     summary: Borrar cliente soft o hard
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
 *         description: Cliente archivado
 *       204:
 *         description: Cliente eliminado definitivamente
 */
router.get('/:id', validate(idParamSchema), getClient);
router.put('/:id', validate(updateClientSchema), updateClient);
router.delete('/:id', validate(idParamSchema.merge(softDeleteQuerySchema)), deleteClient);
/**
 * @openapi
 * /api/client/{id}/restore:
 *   patch:
 *     tags: [Clients]
 *     security: [{ bearerAuth: [] }]
 *     summary: Restaurar cliente archivado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cliente restaurado
 */
router.patch('/:id/restore', validate(idParamSchema), restoreClient);

export default router;
