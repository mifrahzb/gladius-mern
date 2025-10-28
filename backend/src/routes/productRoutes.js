import express from 'express';
import {
  getProducts, 
  getProductById, 
  getProductBySlug, 
  getFeatured, 
  getCategories,
  createProduct, 
  updateProduct, 
  deleteProduct
} from '../controllers/productController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin routes with file upload middleware
router.post('/', auth, admin, upload.single('image'), createProduct);
router.put('/:id', auth, admin, upload.single('image'), updateProduct);
router.delete('/:id', auth, admin, deleteProduct);

export default router;