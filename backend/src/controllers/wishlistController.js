import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// Get wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items');
  res.json(wishlist || { items: [] });
});

// Add item
export const addWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, items: [] });

  if (!wishlist.items.includes(productId)) {
    wishlist.items.push(productId);
    await wishlist.save();
  }
  res.json(wishlist);
});

// Remove item
export const removeWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

  wishlist.items = wishlist.items.filter(id => id.toString() !== productId.toString());
  await wishlist.save();
  res.json(wishlist);
});
