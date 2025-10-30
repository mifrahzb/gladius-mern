import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Create product review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this product' 
      });
    }

    // Check if user purchased this product (optional but recommended)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      isDelivered: true
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
      verified: !!hasPurchased
    });

    // Populate user info for response
    await review.populate('user', 'name');

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating.toFixed(1),
      numReviews: reviews.length
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only review owner or admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const productId = review.product;
    await review.deleteOne();
    
    // Update product rating
    await updateProductRating(productId);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};