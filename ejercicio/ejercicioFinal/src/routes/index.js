import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    name: 'BildyApp API',
    version: '1.0.0'
  });
});

export default router;
