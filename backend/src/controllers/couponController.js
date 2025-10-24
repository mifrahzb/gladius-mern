import Coupon from '../models/Coupon.js';
import asyncHandler from 'express-async-handler';

// Validate coupon
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Coupon code required' });

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
  if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon' });

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Coupon expired' });
  }

  res.json({ valid: true, coupon });
});

// Admin CRUD for coupons
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const payload = req.body;
  const coupon = new Coupon(payload);
  const created = await coupon.save();
  res.status(201).json(created);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  Object.assign(coupon, req.body);
  await coupon.save();
  res.json(coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  await coupon.remove();
  res.json({ message: 'Coupon deleted' });
});
