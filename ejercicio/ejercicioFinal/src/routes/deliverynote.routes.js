import { Router } from 'express';
import {
  createDeliveryNote,
  deleteDeliveryNote,
  downloadDeliveryNotePdf,
  getDeliveryNote,
  listDeliveryNotes
} from '../controllers/deliverynote.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import { createDeliveryNoteSchema, listDeliveryNotesSchema } from '../validators/deliverynote.validator.js';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createDeliveryNoteSchema), createDeliveryNote);
router.get('/', validate(listDeliveryNotesSchema), listDeliveryNotes);
router.get('/pdf/:id', validate(idParamSchema), downloadDeliveryNotePdf);
router.get('/:id', validate(idParamSchema), getDeliveryNote);
router.delete('/:id', validate(idParamSchema), deleteDeliveryNote);

export default router;
