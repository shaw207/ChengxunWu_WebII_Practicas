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

router.get('/archived', validate(archivedListSchema), listArchivedProjects);
router.post('/', validate(createProjectSchema), createProject);
router.get('/', validate(listProjectsSchema), listProjects);
router.get('/:id', validate(idParamSchema), getProject);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', validate(idParamSchema.merge(softDeleteQuerySchema)), deleteProject);
router.patch('/:id/restore', validate(idParamSchema), restoreProject);

export default router;
