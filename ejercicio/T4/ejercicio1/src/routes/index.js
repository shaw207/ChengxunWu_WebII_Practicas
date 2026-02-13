// src/routes/index.js
import { Router } from 'express';
import tasksRoutes from './task.routes.js';

const router = Router();

router.use('/todos', tasksRoutes);

router.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Task v1.0',
    endpoints: {
      todos: '/api/todos',
      health: '/health'
    }
  });
});

export default router;