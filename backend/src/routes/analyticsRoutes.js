import express from 'express';
import {
  trackAnalyticsEvent,
  endAnalyticsSession,
  getAnalyticsDashboard,
  getProductAnalyticsData
} from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

// Public routes (for frontend tracking)
router.post('/track', trackAnalyticsEvent);
router.post('/end-session', endAnalyticsSession);

// Admin routes
router.get('/dashboard', auth, admin, getAnalyticsDashboard);
router.get('/product/:productId', auth, admin, getProductAnalyticsData);

export default router;