import express from 'express';
import {
  addReview, getProductReviews, moderateReview, updateReview, deleteReview
} from '../controllers/reviewController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.post('/:productId', auth, addReview);
router.get('/:productId', getProductReviews);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

// moderation
router.put('/:id/moderate', auth, admin, moderateReview);

export default router;
