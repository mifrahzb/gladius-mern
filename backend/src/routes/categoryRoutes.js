// backend/src/routes/categoryRoutes.js
import express from 'express';
import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json(categories);
}));

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
}));

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
}));

// @desc    Create category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', auth, admin, asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
    description,
    image,
  });

  res.status(201).json(category);
}));

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', auth, admin, asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;
    category.image = req.body.image || category.image;
    category.isActive = req.body.isActive !== undefined ? req.body.isActive : category.isActive;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
}));

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', auth, admin, asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
}));

export default router;