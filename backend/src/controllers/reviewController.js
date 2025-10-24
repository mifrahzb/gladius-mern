import Review from '../models/Review.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// Add review
export const addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  const existing = await Review.findOne({ user: req.user._id, product: productId });
  if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

  const review = new Review({
    user: req.user._id,
    product: productId,
    rating,
    title,
    comment,
    approved: false
  });

  await review.save();

  const reviews = await Review.find({ product: productId, approved: true });
  const numReviews = reviews.length;
  const ratingAvg = numReviews ? (reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews) : 0;

  await Product.findByIdAndUpdate(productId, { numReviews, rating: ratingAvg });

  res.status(201).json({ message: 'Review submitted for moderation' });
});

// Get reviews for product
export const getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const reviews = await Review.find({ product: productId, approved: true }).populate('user', 'name');
  res.json(reviews);
});

// Approve/Reject review (admin)
export const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  review.approved = req.body.approved === true;
  await review.save();
  res.json({ message: 'Review updated', review });
});

// Update review (owner)
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

  review.rating = req.body.rating ?? review.rating;
  review.title = req.body.title ?? review.title;
  review.comment = req.body.comment ?? review.comment;
  await review.save();
  res.json(review);
});

// Delete review (owner or admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await review.remove();
  res.json({ message: 'Review removed' });
});
