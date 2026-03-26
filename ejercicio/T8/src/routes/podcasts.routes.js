import { Router } from 'express';
import {
  getPodcasts,
  getPodcast,
  getAllPodcastsAdmin,
  createPodcast,
  updatePodcast,
  deletePodcast,
  publishPodcast
} from '../controllers/podcasts.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createPodcastSchema,
  updatePodcastSchema,
  publishPodcastSchema,
  idParamSchema
} from '../validators/podcast.validator.js';
import authMiddleware from '../middleware/session.middleware.js';
import checkRol from '../middleware/rol.middleware.js';

const router = Router();

/**
 * @openapi
 * /api/podcasts:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Listar podcasts publicados
 *     description: Devuelve solo podcasts publicados.
 *     responses:
 *       200:
 *         description: Lista de podcasts publicados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Podcast'
 */
router.get('/', getPodcasts);

/**
 * @openapi
 * /api/podcasts/admin/all:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Listar todos los podcasts
 *     description: Devuelve todos los podcasts, incluidos los no publicados.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de podcasts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Podcast'
 *       401:
 *         description: Token ausente o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/admin/all', authMiddleware, checkRol('admin'), getAllPodcastsAdmin);

/**
 * @openapi
 * /api/podcasts/{id}:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Obtener un podcast
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del podcast
 *     responses:
 *       200:
 *         description: Podcast encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Podcast'
 *       404:
 *         description: Podcast no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validate(idParamSchema), getPodcast);

/**
 * @openapi
 * /api/podcasts:
 *   post:
 *     tags:
 *       - Podcasts
 *     summary: Crear podcast
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePodcastRequest'
 *     responses:
 *       201:
 *         description: Podcast creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Podcast'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token ausente o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/',
  authMiddleware,
  validate(createPodcastSchema),
  createPodcast
);

/**
 * @openapi
 * /api/podcasts/{id}:
 *   put:
 *     tags:
 *       - Podcasts
 *     summary: Actualizar podcast propio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del podcast
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePodcastRequest'
 *     responses:
 *       200:
 *         description: Podcast actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Podcast'
 *       401:
 *         description: Token ausente o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Solo el autor puede actualizar su podcast
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Podcast no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id',
  authMiddleware,
  validate(idParamSchema),
  validate(updatePodcastSchema),
  updatePodcast
);

/**
 * @openapi
 * /api/podcasts/{id}:
 *   delete:
 *     tags:
 *       - Podcasts
 *     summary: Eliminar podcast
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del podcast
 *     responses:
 *       200:
 *         description: Podcast eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Podcast eliminado
 *                 data:
 *                   $ref: '#/components/schemas/Podcast'
 *       401:
 *         description: Token ausente o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Podcast no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id',
  authMiddleware,
  checkRol('admin'),
  validate(idParamSchema),
  deletePodcast
);

/**
 * @openapi
 * /api/podcasts/{id}/publish:
 *   patch:
 *     tags:
 *       - Podcasts
 *     summary: Publicar o despublicar podcast
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del podcast
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublishPodcastRequest'
 *     responses:
 *       200:
 *         description: Estado de publicación actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Podcast'
 *       401:
 *         description: Token ausente o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Solo administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Podcast no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/publish',
  authMiddleware,
  checkRol('admin'),
  validate(idParamSchema),
  validate(publishPodcastSchema),
  publishPodcast
);

export default router;
