import { Router } from 'express';
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  getBookStats,
  updateBook,
} from '../controllers/books.controller.js';
import { allowRoles, authRequired } from '../middleware/auth.middleware.js';
import {
  bookIdParamsSchema,
  booksQuerySchema,
  buildRequestSchema,
  createBookSchema,
  statsQuerySchema,
  updateBookSchema,
  validate,
  validateBody,
} from '../schemas/validation.js';

const router = Router();

router.get(
  '/',
  validate(
    buildRequestSchema({
      query: booksQuerySchema,
    }),
  ),
  getBooks,
);

router.get(
  '/stats',
  authRequired,
  allowRoles(['LIBRARIAN', 'ADMIN']),
  validate(
    buildRequestSchema({
      query: statsQuerySchema,
    }),
  ),
  getBookStats,
);

router.get(
  '/:id',
  validate(
    buildRequestSchema({
      params: bookIdParamsSchema,
    }),
  ),
  getBookById,
);

router.post(
  '/',
  authRequired,
  allowRoles(['LIBRARIAN', 'ADMIN']),
  validateBody(createBookSchema),
  createBook,
);

router.put(
  '/:id',
  authRequired,
  allowRoles(['LIBRARIAN', 'ADMIN']),
  validate(
    buildRequestSchema({
      params: bookIdParamsSchema,
      body: updateBookSchema,
    }),
  ),
  updateBook,
);

router.delete(
  '/:id',
  authRequired,
  allowRoles(['ADMIN']),
  validate(
    buildRequestSchema({
      params: bookIdParamsSchema,
    }),
  ),
  deleteBook,
);

export default router;
