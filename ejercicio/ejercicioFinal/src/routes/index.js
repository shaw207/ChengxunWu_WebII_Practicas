import { Router } from 'express';
import authRoutes from './auth.routes.js';
import clientRoutes from './client.routes.js';
import deliveryNoteRoutes from './deliverynote.routes.js';
import projectRoutes from './project.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    name: 'BildyApp API',
    version: '1.0.0'
  });
});

router.use('/client', clientRoutes);
router.use('/project', projectRoutes);
router.use('/deliverynote', deliveryNoteRoutes);
router.use('/user', userRoutes);
router.use('/auth', authRoutes);

export default router;
