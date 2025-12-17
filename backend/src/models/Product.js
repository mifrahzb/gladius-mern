import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required:  true,
  },
  image: {
    type: String,
  },
  images: [mongoose.Schema.Types.Mixed],
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  countInStock: {
    type:  Number,
    required: true,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    unique: true,
  },
  
  // KNIFE SPECIFICATIONS
  specifications: {
    bladeLength: String,
    handleLength: String,
    totalLength: String,
    weight:  String,
    bladeFinish: String,
    handleMaterial: String,
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // SEO META FIELDS (EXISTING)
  metaTitle: {
    type: String,
    maxlength: 200
  },
  metaDescription:  {
    type: String,
    maxlength: 300
  },
  metaKeywords: [String],
  imageAlts: [{
    imageUrl: String,
    altText:  String,
    category: String // NEW:  image category (primary, detail, lifestyle, etc.)
  }],
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  canonicalUrl: String,
  focusKeyword: String,
  
  // AI-GENERATED CONTENT FIELDS (NEW)
  aiGeneratedDescription: {
    type: String,
  },
  aiGeneratedMetaDescription: {
    type: String,
    maxlength: 300
  },
  aiSuggestedKeywords: [String],
  aiKeywordIntent: [{
    keyword: String,
    intent: {
      type: String,
      enum: ['informational', 'navigational', 'transactional']
    }
  }],
  aiApprovalStatus: {
    type:  String,
    enum: ['pending', 'approved', 'rejected', null],
    default: null
  },
  aiGeneratedAt: {
    type: Date
  },
  
  // STRUCTURED DATA (NEW)
  productSchema: {
    type: mongoose.Schema.Types.Mixed, // JSON-LD Product Schema
  },
  faqSchema: {
    type:  mongoose.Schema.Types.Mixed, // JSON-LD FAQ Schema
  },
  faqs: [{
    question: String,
    answer: String
  }],
  
  // ANALYTICS DATA (NEW)
  analytics: {
    views: { type: Number, default: 0 },
    addToCart:  { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    conversionRate:  { type: Number, default: 0 },
    lastCalculated: Date
  }
  
}, {
  timestamps: true,
});

// INDEXES
productSchema.index({ slug: 1 });
productSchema.index({ name: 'text', description: 'text', metaKeywords: 'text' });
productSchema.index({ category: 1, isFeatured: -1 });
productSchema.index({ aiApprovalStatus: 1 });
productSchema.index({ 'analytics.conversionRate': -1 });

// PRE-SAVE MIDDLEWARE
productSchema.pre('save', function(next) {
  // Generate slug from name
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Auto-generate meta title if not provided
  if (this.isModified('name') && !this.metaTitle) {
    const generatedTitle = `${this.name} | Gladius Traders`;
    this.metaTitle = generatedTitle. length > 200 
      ? generatedTitle.substring(0, 197) + '...' 
      : generatedTitle;
  }
  
  // Auto-generate basic meta description if not provided
  if (this.isModified('description') && !this.metaDescription) {
    const plainDesc = this.description.replace(/<[^>]*>/g, '');
    this.metaDescription = plainDesc. length > 300 
      ? plainDesc.substring(0, 297) + '...' 
      : plainDesc;
  }
  
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;