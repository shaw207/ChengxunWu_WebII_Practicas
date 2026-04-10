import { Router } from 'express';

const router = Router();

function notImplemented(req, res) {
  res.status(501).json({
    status: 'pending',
    message: 'Auth module will be implemented in the next steps.'
  });
}

router.post('/register', notImplemented);
router.post('/login', notImplemented);
router.get('/me', notImplemented);

export default router;
