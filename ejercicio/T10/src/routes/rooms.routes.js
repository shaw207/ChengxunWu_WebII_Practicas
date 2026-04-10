import { Router } from 'express';

const router = Router();

function notImplemented(req, res) {
  res.status(501).json({
    status: 'pending',
    message: 'Rooms module will be implemented in the next steps.'
  });
}

router.get('/', notImplemented);
router.post('/', notImplemented);
router.get('/:id/messages', notImplemented);

export default router;
