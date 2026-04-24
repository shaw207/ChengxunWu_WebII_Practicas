import { Router } from 'express';
import {
  createLoan,
  getAllLoans,
  getMyLoans,
  returnLoan,
} from '../controllers/loans.controller.js';
import { allowRoles, authRequired } from '../middleware/auth.middleware.js';
import {
  buildRequestSchema,
  createLoanSchema,
  loanIdParamsSchema,
  validate,
  validateBody,
} from '../schemas/validation.js';

const router = Router();

router.get('/', authRequired, getMyLoans);

router.get(
  '/all',
  authRequired,
  allowRoles(['LIBRARIAN', 'ADMIN']),
  getAllLoans,
);

router.post(
  '/',
  authRequired,
  validateBody(createLoanSchema),
  createLoan,
);

router.put(
  '/:id/return',
  authRequired,
  validate(
    buildRequestSchema({
      params: loanIdParamsSchema,
    }),
  ),
  returnLoan,
);

export default router;
