import mongoose from 'mongoose';

/**
 * FEATURE 5: Category Content (buying guides, descriptions, etc.)
 */
const categoryContentSchema = new mongoose.Schema({
  category: {
    type: mongoose. Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  buyingGuide: {
    type: String
  },
  faqs: [{
    question: String,
    answer: String
  }],
  relatedArticles: [{
    title: String,
    content: String,
    slug: String,
    publishedAt: Date
  }],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type:  Date,
    default: Date. now
  }
}, {
  timestamps: true
});

categoryContentSchema.index({ category: 1 });

const CategoryContent = mongoose.model('CategoryContent', categoryContentSchema);
export default CategoryContent;