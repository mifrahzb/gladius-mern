import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// GET /api/admin/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const usersCount = await User.countDocuments();
  const productsCount = await Product.countDocuments();
  const ordersCount = await Order.countDocuments();
  const totalSalesAgg = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  const totalSales = totalSalesAgg[0]?.total || 0;
  res.json({ usersCount, productsCount, ordersCount, totalSales });
});

// Get all users (admin)
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// Update order status (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (req.body.status === 'shipped') {
    order.isDelivered = false;
    order.shippingStatus = 'shipped';
  }
  if (req.body.status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();
  res.json(order);
});
