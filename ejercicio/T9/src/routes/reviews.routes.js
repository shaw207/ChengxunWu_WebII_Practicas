import { Router } from 'express';
import {
  createReview,
  deleteReview,
  getBookReviews,
} from '../controllers/reviews.controller.js';
import { authRequired } from '../middleware/auth.middleware.js';
import {
  bookIdParamsSchema,
  buildRequestSchema,
  createReviewSchema,
  reviewIdParamsSchema,
  validate,
} from '../schemas/validation.js';

const router = Router();

router.get(
  '/books/:id/reviews',
  validate(
    buildRequestSchema({
      params: bookIdParamsSchema,
    }),
  ),
  getBookReviews,
);

router.post(
  '/books/:id/reviews',
  authRequired,
  validate(
    buildRequestSchema({
      params: bookIdParamsSchema,
      body: createReviewSchema,
    }),
  ),
  createReview,
);

router.delete(
  '/reviews/:id',
  authRequired,
  validate(
    buildRequestSchema({
      params: reviewIdParamsSchema,
    }),
  ),
  deleteReview,
);

export default router;
