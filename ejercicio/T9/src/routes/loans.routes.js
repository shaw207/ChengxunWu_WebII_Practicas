import { Router } from 'express';
import {
  createLoan,
  getAllLoans,
  getMyLoans,
  returnLoan,
} from '../controllers/loans.controller.js';

const router = Router();

router.get('/', getMyLoans);
router.get('/all', getAllLoans);
router.post('/', createLoan);
router.put('/:id/return', returnLoan);

export default router;
