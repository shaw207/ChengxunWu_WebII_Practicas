import { Router } from 'express';
import {
  getPodcasts,
  getPodcast,
  createPodcast,
  updatePodcast,
  deletePodcast
} from '../controllers/podcasts.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createPodcastSchema, updatePodcastSchema, idParamSchema } from '../validators/podcast.validator.js';
import authMiddleware from '../middleware/session.middleware.js';
import checkRol from '../middleware/rol.middleware.js';

const router = Router();

/**
 * @openapi
 * /api/podcasts:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Obtener todos los podcasts
 *     description: Lista todos los podcasts de la base de datos
 *     responses:
 *       200:
 *         description: Lista de podcasts
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
 * /api/podcasts/{id}:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Obtener podcast por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del podcast (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podcast encontrado
 *       404:
 *         description: Podcast no encontrado
 */
router.get('/:id', validate(idParamSchema), getPodcast);

/**
 * @openapi
 * /api/podcasts:
 *   post:
 *     tags:
 *       - Podcasts
 *     summary: Crear un podcast
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *                 example: Mi Podcast
 *               duration:
 *                 type: integer
 *                 example: 180
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["rock", "pop"]
 *     responses:
 *       201:
 *         description: Podcast creado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
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
 *     summary: Actualizar un podcast
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               duration:
 *                 type: integer
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Podcast actualizado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Podcast no encontrado
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
 *     summary: Eliminar un podcast
 *     description: Solo administradores pueden eliminar podcasts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podcast eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Podcast no encontrado
 */
router.delete('/:id',
  authMiddleware,
  checkRol('admin'),
  validate(idParamSchema),
  deletePodcast
);

export default router;
