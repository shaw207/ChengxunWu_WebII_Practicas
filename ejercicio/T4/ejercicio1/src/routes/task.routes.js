// src/routes/task.routes
import { Router } from 'express';
import * as controller from '../controllers/task.controller.js';
import { validate } from '../middleware/validateRequest.js';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createTaskSchema), controller.create);
router.put('/:id', validate(updateTaskSchema), controller.update);
router.patch('/:id', validate(updateTaskSchema), controller.partialUpdate);
router.patch('/:id/toggle', controller.toggle);
router.delete('/:id', controller.remove);

export default router;