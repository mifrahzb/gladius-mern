import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// Get user's cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
    await cart.save();
  }
  res.json(cart);
});

// Add to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find(item => item.product.toString() === productId);
  if (existing) {
    existing.qty = existing.qty + quantity;
  } else {
    cart.items.push({ product: productId, qty: quantity });
  }
  cart.updatedAt = Date.now();
  await cart.save();
  res.json(cart);
});

// Update cart item
export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { qty } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.id(itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  item.qty = qty;
  cart.updatedAt = Date.now();
  await cart.save();
  res.json(cart);
});

// Remove cart item
export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();
  res.json(cart);
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.items = [];
  await cart.save();
  res.json({ message: 'Cart cleared' });
});
