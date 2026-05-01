import { Router } from 'express';
import {
  createDeliveryNote,
  deleteDeliveryNote,
  downloadDeliveryNotePdf,
  getDeliveryNote,
  listDeliveryNotes,
  signDeliveryNote
} from '../controllers/deliverynote.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { requireFile, uploadSignature } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import { createDeliveryNoteSchema, listDeliveryNotesSchema } from '../validators/deliverynote.validator.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/deliverynote:
 *   post:
 *     tags: [DeliveryNotes]
 *     security: [{ bearerAuth: [] }]
 *     summary: Crear albaran
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [project, format, description, workDate, material, quantity, unit]
 *                 properties:
 *                   project: { type: string }
 *                   format: { type: string, enum: [material] }
 *                   description: { type: string }
 *                   workDate: { type: string, format: date }
 *                   material: { type: string }
 *                   quantity: { type: number }
 *                   unit: { type: string }
 *               - type: object
 *                 required: [project, format, description, workDate]
 *                 properties:
 *                   project: { type: string }
 *                   format: { type: string, enum: [hours] }
 *                   description: { type: string }
 *                   workDate: { type: string, format: date }
 *                   hours: { type: number }
 *                   workers:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Worker'
 *     responses:
 *       201:
 *         description: Albaran creado
 *   get:
 *     tags: [DeliveryNotes]
 *     security: [{ bearerAuth: [] }]
 *     summary: Listar albaranes
 *     parameters:
 *       - in: query
 *         name: project
 *         schema: { type: string }
 *       - in: query
 *         name: client
 *         schema: { type: string }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [material, hours] }
 *       - in: query
 *         name: signed
 *         schema: { type: boolean }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: -workDate }
 *     responses:
 *       200:
 *         description: Albaranes paginados
 */
router.post('/', validate(createDeliveryNoteSchema), createDeliveryNote);
router.get('/', validate(listDeliveryNotesSchema), listDeliveryNotes);
/**
 * @openapi
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     tags: [DeliveryNotes]
 *     security: [{ bearerAuth: [] }]
 *     summary: Descargar PDF del albaran
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/pdf/:id', validate(idParamSchema), downloadDeliveryNotePdf);
/**
 * @openapi
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     tags: [DeliveryNotes]
 *     security: [{ bearerAuth: [] }]
 *     summary: Firmar albaran y subir firma/PDF a Cloudinary
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [signature]
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albaran firmado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.patch('/:id/sign', validate(idParamSchema), uploadSignature.single('signature'), requireFile('signature'), signDeliveryNote);
/**
 * @openapi
 * /api/deliverynote/{id}:
 *   get:
 *     tags: [DeliveryNotes]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener albaran
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Albaran encontrado
 *   delete:
 *     tags: [DeliveryNotes]
 *     security: [{ bearerAuth: [] }]
 *     summary: Borrar albaran no firmado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Albaran eliminado
 *       400:
 *         description: El albaran firmado no puede borrarse
 */
router.get('/:id', validate(idParamSchema), getDeliveryNote);
router.delete('/:id', validate(idParamSchema), deleteDeliveryNote);

export default router;
