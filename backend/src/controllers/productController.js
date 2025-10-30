import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
import { generateSlug, generateMetaDescription, generateImageAlt } from '../utils/SEO.js';
import fs from 'fs';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 50;
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
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        categoryFilter = { category: req.query.category };
      } else {
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
      .populate('category', 'name slug metaTitle metaDescription')
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
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug metaTitle metaDescription');

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
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug metaTitle metaDescription');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get product by category slug and product slug (SEO-friendly URL)
// @route   GET /api/products/:categorySlug/:productSlug
// @access  Public
export const getProductByCategoryAndSlug = asyncHandler(async (req, res) => {
  const { categorySlug, productSlug } = req.params;
  
  // Find category first
  const category = await Category.findOne({ slug: categorySlug });
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Find product with matching slug and category
  const product = await Product.findOne({ 
    slug: productSlug,
    category: category._id
  }).populate('category', 'name slug metaTitle metaDescription');

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
  const products = await Product.find({ isFeatured: true })
    .populate('category', 'name slug')
    .limit(8)
    .sort({ createdAt: -1 });
  res.json(products);
});

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  try {
    let imageUrl;
    let imageData = null;
    
    // Check if file was uploaded
    if (req.file) {
      console.log('📁 File uploaded:', req.file.filename);
      imageData = await uploadImage(req.file);
      imageUrl = imageData.url;
      console.log('☁️  Cloudinary URL:', imageData.url);
    } else if (req.body.image || req.body.imageUrl) {
      imageUrl = req.body.image || req.body.imageUrl;
      imageData = { url: imageUrl, public_id: null };
      console.log('🔗 Using image URL:', imageUrl);
    } else {
      return res.status(400).json({ message: 'Image required (file or URL)' });
    }
    
    // Parse specifications if it's a string
    let specifications = req.body.specifications;
    if (typeof specifications === 'string') {
      try {
        specifications = JSON.parse(specifications);
      } catch (e) {
        specifications = {};
      }
    }
    
    // Generate slug if not provided
    const slug = req.body.slug || generateSlug(req.body.name);
    
    // Get category for SEO
    const category = await Category.findById(req.body.category);
    const categoryName = category ? category.name : 'Knife';
    
    // Auto-generate image alt texts with SEO keywords
    const imageAlts = [{
      imageUrl: imageUrl,
      altText: req.body.imageAlt || generateImageAlt(req.body.name, categoryName, 0)
    }];
    
    // Create product with SEO fields
    const product = new Product({
      name: req.body.name,
      slug: slug,
      price: req.body.price,
      description: req.body.description || '',
      richDescription: req.body.richDescription || req.body.description || '',
      specifications: specifications || {},
      countInStock: req.body.countInStock || 0,
      category: req.body.category,
      brand: req.body.brand,
      image: imageUrl,
      images: [imageData],
      imageAlts: imageAlts,
      isFeatured: req.body.isFeatured || false,
      // SEO fields
      metaTitle: req.body.metaTitle || `${req.body.name} | Gladius Traders`,
      metaDescription: req.body.metaDescription || generateMetaDescription(req.body.description),
      metaKeywords: req.body.metaKeywords || [],
      focusKeyword: req.body.focusKeyword || req.body.name,
      canonicalUrl: `/product/${category?.slug || 'knives'}/${slug}`,
      // Open Graph
      ogTitle: req.body.ogTitle || req.body.name,
      ogDescription: req.body.ogDescription || generateMetaDescription(req.body.description),
      ogImage: imageUrl
    });
    
    const created = await product.save();
    console.log('✅ Product created:', created._id);
    
    res.status(201).json(created);
    
  } catch (error) {
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
    
    let imageUrl = product.image;
    let imageData;
    
    // Check if new image uploaded
    if (req.file) {
      console.log('📁 New file uploaded:', req.file.filename);
      
      // Delete old image from Cloudinary if exists
      if (product.images?.[0]?.public_id) {
        console.log('🗑️  Deleting old image:', product.images[0].public_id);
        await deleteImage(product.images[0].public_id);
      }
      
      // Upload new image
      imageData = await uploadImage(req.file);
      imageUrl = imageData.url;
      product.images = [imageData];
      product.image = imageUrl;
      
      // Update image alt text
      const category = await Category.findById(product.category);
      const categoryName = category ? category.name : 'Knife';
      product.imageAlts = [{
        imageUrl: imageUrl,
        altText: req.body.imageAlt || generateImageAlt(product.name, categoryName, 0)
      }];
      
    } else if (req.body.image || req.body.imageUrl) {
      const newImageUrl = req.body.image || req.body.imageUrl;
      if (newImageUrl !== product.image) {
        imageUrl = newImageUrl;
        imageData = { url: imageUrl, public_id: null };
        product.images = [imageData];
        product.image = imageUrl;
      }
    }
    
    // Parse specifications if it's a string
    let specifications = req.body.specifications;
    if (typeof specifications === 'string') {
      try {
        specifications = JSON.parse(specifications);
      } catch (e) {
        specifications = product.specifications;
      }
    }
    
    // Update fields
    if (req.body.name) {
      product.name = req.body.name;
      // Update slug if name changed
      product.slug = req.body.slug || generateSlug(req.body.name);
    }
    if (req.body.price !== undefined) product.price = req.body.price;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.richDescription !== undefined) product.richDescription = req.body.richDescription;
    if (req.body.countInStock !== undefined) product.countInStock = req.body.countInStock;
    if (req.body.category) product.category = req.body.category;
    if (req.body.brand) product.brand = req.body.brand;
    if (specifications) product.specifications = specifications;
    if (req.body.isFeatured !== undefined) product.isFeatured = req.body.isFeatured;
    
    // Update SEO fields
    if (req.body.metaTitle !== undefined) product.metaTitle = req.body.metaTitle;
    if (req.body.metaDescription !== undefined) product.metaDescription = req.body.metaDescription;
    if (req.body.metaKeywords !== undefined) product.metaKeywords = req.body.metaKeywords;
    if (req.body.focusKeyword !== undefined) product.focusKeyword = req.body.focusKeyword;
    if (req.body.ogTitle !== undefined) product.ogTitle = req.body.ogTitle;
    if (req.body.ogDescription !== undefined) product.ogDescription = req.body.ogDescription;
    if (req.body.ogImage !== undefined) product.ogImage = req.body.ogImage;
    
    const updated = await product.save();
    console.log('✅ Product updated:', updated._id);
    
    res.json(updated);
    
  } catch (error) {
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

// @desc    Get all categories with names
// @route   GET /api/categories
// @access  Public
export const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({}).select('name slug _id metaTitle metaDescription');
    res.json(categories);
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ message: error.message });
  }
});