import express from 'express';
import { getWishlist, addWishlist, removeWishlist } from '../controllers/wishlistController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getWishlist);
router.post('/add/:productId', auth, addWishlist);
router.delete('/remove/:productId', auth, removeWishlist);

export default router;
