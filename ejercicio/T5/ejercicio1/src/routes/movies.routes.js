// src/routes/movies.routes.js
import { Router } from 'express';
import * as controller from '../controllers/movie.controller.js';
import multerConfig from '../utils/multer.js';

const router = Router();
const upload = multerConfig.single('cover');

router.get('/', controller.list);
router.get('/stats/top', controller.top);
router.get('/:id/cover', controller.getCover);
router.get('/:id', controller.getById);

router.post('/', controller.create);

router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

router.patch('/:id/rent', controller.rent);
router.patch('/:id/return', controller.returnMovie);
router.patch('/:id/cover', upload, controller.uploadCover);

export default router;