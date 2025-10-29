import Product from '../models/Product.js';
import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
import fs from 'fs';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
// @desc    Get products by category ID or name
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    let categoryFilter = {};
    
    // Handle category filtering
    if (req.query.category) {
      // Check if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        categoryFilter = { category: req.query.category };
      } else {
        // If it's not an ObjectId, try to find category by name
        const category = await Category.findOne({
          $or: [
            { name: new RegExp(req.query.category, 'i') },
            { slug: new RegExp(req.query.category, 'i') }
          ]
        });
        if (category) {
          categoryFilter = { category: category._id };
        }
      }
    }

    const count = await Product.countDocuments({
      ...keyword,
      ...categoryFilter,
    });

    const products = await Product.find({
      ...keyword,
      ...categoryFilter,
    })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json(products);
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  try {
    let imageData;
    
    // Check if file was uploaded
    if (req.file) {
      console.log('📁 File uploaded:', req.file.filename);
      
      // Upload to Cloudinary
      imageData = await uploadImage(req.file);
      console.log('☁️  Cloudinary URL:', imageData.url);
      
    } else if (req.body.imageUrl) {
      // Fallback: Allow URL input if no file uploaded
      console.log('🔗 Using image URL:', req.body.imageUrl);
      imageData = { 
        url: req.body.imageUrl,
        public_id: null 
      };
    } else {
      return res.status(400).json({ message: 'Image required (file or URL)' });
    }
    
    // Create product with image
    const product = new Product({
      name: req.body.name,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
      price: req.body.price,
      description: req.body.description || '',
      specifications: req.body.specifications || {},
      stock: req.body.stock || 0,
      category: req.body.category || 'general',
      images: [imageData],
      isFeatured: req.body.isFeatured || false
    });
    
    const created = await product.save();
    console.log('✅ Product created:', created._id);
    
    res.status(201).json(created);
    
  } catch (error) {
    // Clean up uploaded file if error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('❌ Create product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let imageData;
    
    // Check if new image uploaded
    if (req.file) {
      console.log('📁 New file uploaded:', req.file.filename);
      
      // Delete old image from Cloudinary if exists
      if (product.images[0]?.public_id) {
        console.log('🗑️  Deleting old image:', product.images[0].public_id);
        await deleteImage(product.images[0].public_id);
      }
      
      // Upload new image
      imageData = await uploadImage(req.file);
      product.images = [imageData];
      
    } else if (req.body.imageUrl && req.body.imageUrl !== product.images[0]?.url) {
      // URL changed
      imageData = { 
        url: req.body.imageUrl,
        public_id: null 
      };
      product.images = [imageData];
    }
    // If no new image, keep existing
    
    // Update other fields
    if (req.body.name) product.name = req.body.name;
    if (req.body.slug) product.slug = req.body.slug;
    if (req.body.price !== undefined) product.price = req.body.price;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.stock !== undefined) product.stock = req.body.stock;
    if (req.body.category) product.category = req.body.category;
    if (req.body.specifications) product.specifications = req.body.specifications;
    if (req.body.isFeatured !== undefined) product.isFeatured = req.body.isFeatured;
    
    const updated = await product.save();
    console.log('✅ Product updated:', updated._id);
    
    res.json(updated);
    
  } catch (error) {
    // Clean up uploaded file if error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('❌ Update product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          console.log('🗑️  Deleting image:', image.public_id);
          await deleteImage(image.public_id);
        }
      }
    }
    
    await product.deleteOne();
    console.log('✅ Product deleted:', req.params.id);
    
    res.json({ message: 'Product removed' });
    
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ message: error.message });
  }
});