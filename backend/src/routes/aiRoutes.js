import express from 'express';
import {
  generateAIContent,
  approveAIContent,
  rejectAIContent,
  analyzeProduct,
  batchGenerateAI,
  generateCategoryBuyingGuide,
  generateProductComparison,
  getAIProductsStatus,
  regenerateAIContent,
  editAIContent
} from '../controllers/aiController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.post('/generate/:productId', auth, admin, generateAIContent);
router.put('/approve/:productId', auth, admin, approveAIContent);
router.put('/reject/:productId', auth, admin, rejectAIContent);
router.put('/regenerate/:productId', auth, admin, regenerateAIContent);
router.get('/analyze/:productId', auth, admin, analyzeProduct);
router.put('/edit/:productId', auth, admin, editAIContent);
router.post('/batch-generate', auth, admin, batchGenerateAI);
router.post('/category/:categoryId/buying-guide', auth, admin, generateCategoryBuyingGuide);
router.post('/compare', auth, admin, generateProductComparison);
router.get('/products/status', auth, admin, getAIProductsStatus);

export default router;