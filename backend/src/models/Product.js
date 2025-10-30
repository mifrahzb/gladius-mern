import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  // Change this to accept both strings and objects
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
  // Rich text description for SEO (HTML format with formatting)
  richDescription: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  countInStock: {
    type: Number,
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
  specifications: {
    bladeLength: String,
    handleMaterial: String,
    bladeMaterial: String,
    totalLength: String,
    weight: String,
    hardness: String,
    origin: String
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // SEO Meta Fields - ✅ REMOVED STRICT LENGTH LIMITS
  metaTitle: {
    type: String,
    maxlength: 200 // Increased from 60 to 200
  },
  metaDescription: {
    type: String,
    maxlength: 300 // Increased from 160 to 300
  },
  metaKeywords: [String], // Array of keywords for SEO
  // Image Alt Text for SEO
  imageAlts: [{
    imageUrl: String,
    altText: String
  }],
  // Open Graph & Social Media Meta
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  // Canonical URL
  canonicalUrl: String,
  // Focus Keyword for SEO
  focusKeyword: String,
}, {
  timestamps: true,
});

// Add slug generation before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    // Generate SEO-friendly slug
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove duplicate hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
  
  // Auto-generate meta title if not provided - ✅ FIXED: Truncate to fit limit
  if (this.isModified('name') && !this.metaTitle) {
    const generatedTitle = `${this.name} | Gladius Traders`;
    this.metaTitle = generatedTitle.length > 200 
      ? generatedTitle.substring(0, 197) + '...' 
      : generatedTitle;
  }
  
  // Auto-generate meta description if not provided - ✅ FIXED: Truncate to fit limit
  if (this.isModified('description') && !this.metaDescription) {
    const plainDesc = this.description.replace(/<[^>]*>/g, ''); // Strip HTML
    this.metaDescription = plainDesc.length > 300 
      ? plainDesc.substring(0, 297) + '...' 
      : plainDesc;
  }
  
  next();
});

// Add index for better search performance
productSchema.index({ slug: 1 });
productSchema.index({ name: 'text', description: 'text', metaKeywords: 'text' });
productSchema.index({ category: 1, isFeatured: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;