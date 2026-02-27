// src/routes/movies.routes.js
import { Router } from 'express';
import * as controller from '../controllers/movie.controller.js';
import multerConfig from '../utils/multer.js';
import { validate, validateObjectId } from '../middleware/validate.middleware.js';
import { createMovieSchema, listMoviesSchema, updateMovieSchema } from '../schemas/movie.schema.js';

const router = Router();
const upload = multerConfig.single('cover');

router.get('/', validate(listMoviesSchema), controller.list);
router.get('/stats/top', controller.top);
router.get('/:id/cover', validateObjectId(), controller.getCover);
router.get('/:id', validateObjectId(), controller.getById);

router.post('/', validate(createMovieSchema), controller.create);

router.put('/:id', validateObjectId(), validate(updateMovieSchema), controller.update);
router.delete('/:id', validateObjectId(), controller.remove);

router.patch('/:id/rent', validateObjectId(), controller.rent);
router.patch('/:id/return', validateObjectId(), controller.returnMovie);
router.patch('/:id/cover', validateObjectId(), upload, controller.uploadCover);

export default router;