import express from 'express';
import {
  getProducts, getProductById, getProductBySlug, getFeatured, getCategories,
  createProduct, updateProduct, deleteProduct
} from '../controllers/productController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// admin
router.post('/', auth, admin, createProduct);
router.put('/:id', auth, admin, updateProduct);
router.delete('/:id', auth, admin, deleteProduct);

export default router;
