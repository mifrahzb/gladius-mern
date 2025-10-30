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
  // SEO Meta Fields
  metaTitle: {
    type: String,
    maxlength: 60 // Google displays ~60 characters
  },
  metaDescription: {
    type: String,
    maxlength: 160 // Google displays ~160 characters
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
  
  // Auto-generate meta title if not provided
  if (this.isModified('name') && !this.metaTitle) {
    this.metaTitle = `${this.name} | Gladius Traders`;
  }
  
  // Auto-generate meta description if not provided
  if (this.isModified('description') && !this.metaDescription) {
    const plainDesc = this.description.replace(/<[^>]*>/g, ''); // Strip HTML
    this.metaDescription = plainDesc.length > 160 
      ? plainDesc.substring(0, 157) + '...' 
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