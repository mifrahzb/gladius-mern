import express from 'express';
import { getDashboardStats, getCustomerStats, getAllReviews } from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.get('/stats', auth, admin, getDashboardStats);
router.get('/customers', auth, admin, getCustomerStats);
router.get('/reviews', auth, admin, getAllReviews);

export default router;