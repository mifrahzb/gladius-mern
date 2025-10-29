import express from 'express';
import { createReview, getProductReviews, deleteReview } from '../controllers/reviewController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createReview);
router.get('/product/:productId', getProductReviews);
router.delete('/:id', auth, deleteReview);

export default router;