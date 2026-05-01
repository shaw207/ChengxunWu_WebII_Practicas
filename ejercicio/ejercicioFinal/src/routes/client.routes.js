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

router.get('/archived', validate(archivedListSchema), listArchivedClients);
router.post('/', validate(createClientSchema), createClient);
router.get('/', validate(listClientsSchema), listClients);
router.get('/:id', validate(idParamSchema), getClient);
router.put('/:id', validate(updateClientSchema), updateClient);
router.delete('/:id', validate(idParamSchema.merge(softDeleteQuerySchema)), deleteClient);
router.patch('/:id/restore', validate(idParamSchema), restoreClient);

export default router;
