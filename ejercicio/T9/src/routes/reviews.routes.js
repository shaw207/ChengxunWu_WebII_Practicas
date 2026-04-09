import { Router } from 'express';
import {
  createReview,
  deleteReview,
  getBookReviews,
} from '../controllers/reviews.controller.js';

const router = Router();

router.get('/books/:id/reviews', getBookReviews);
router.post('/books/:id/reviews', createReview);
router.delete('/reviews/:id', deleteReview);

export default router;
