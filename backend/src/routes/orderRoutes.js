import express from 'express';
import {
  createOrder, getMyOrders, getAllOrders, getOrderById, updateOrderToPaid, updateOrderToDelivered
} from '../controllers/orderController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import { updateOrderStatus } from '../controllers/order.controller.js';

const router = express.Router();

router.post('/', auth, createOrder);
router.get('/myorders', auth, getMyOrders);
router.get('/', auth, admin, getAllOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id/pay', auth, updateOrderToPaid);
router.put('/:id/deliver', auth, admin, updateOrderToDelivered);
router.put('/:id/status', auth, admin, updateOrderStatus);

export default router;
