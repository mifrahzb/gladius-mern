import express from 'express';
import { getDashboard, getUsers, updateOrderStatus } from '../controllers/adminController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.get('/dashboard', auth, admin, getDashboard);
router.get('/users', auth, admin, getUsers);
router.put('/orders/:id', auth, admin, updateOrderStatus);

export default router;
