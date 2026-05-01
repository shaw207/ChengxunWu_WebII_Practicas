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

router.post('/', validate(createDeliveryNoteSchema), createDeliveryNote);
router.get('/', validate(listDeliveryNotesSchema), listDeliveryNotes);
router.get('/pdf/:id', validate(idParamSchema), downloadDeliveryNotePdf);
router.patch('/:id/sign', validate(idParamSchema), uploadSignature.single('signature'), requireFile('signature'), signDeliveryNote);
router.get('/:id', validate(idParamSchema), getDeliveryNote);
router.delete('/:id', validate(idParamSchema), deleteDeliveryNote);

export default router;
