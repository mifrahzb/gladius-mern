import express from 'express';
import { createReview, getProductReviews, deleteReview, getAllReviews } from '../controllers/reviewController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.post('/', auth, createReview);
router.get('/', auth, admin, getAllReviews);
router.get('/product/:productId', getProductReviews);
router.delete('/:id', auth, deleteReview);

export default router;