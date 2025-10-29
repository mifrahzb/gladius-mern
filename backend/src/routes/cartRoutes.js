import express from 'express';
import {
  getCart, addToCart, updateCartItem, removeCartItem, clearCart
} from '../controllers/cartController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getCart);
router.post('/add', auth, addToCart);
router.put('/update/:itemId', auth, updateCartItem);
router.delete('/remove/:productId', auth, removeCartItem);
router.delete('/clear', auth, clearCart);

export default router;
