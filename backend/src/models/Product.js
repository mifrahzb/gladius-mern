import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  
  // ONLY RELEVANT KNIFE SPECIFICATIONS
  specifications: {
    bladeLength: String,
    handleLength: String,
    totalLength: String,
    weight: String,
    bladeFinish: String,
    handleMaterial: String,
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // SEO Meta Fields
  metaTitle: {
    type: String,
    maxlength: 200
  },
  metaDescription: {
    type: String,
    maxlength: 300
  },
  metaKeywords: [String],
  imageAlts: [{
    imageUrl: String,
    altText: String
  }],
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  canonicalUrl: String,
  focusKeyword: String,
}, {
  timestamps: true,
});

// Add slug generation before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  if (this.isModified('name') && !this.metaTitle) {
    const generatedTitle = `${this.name} | Gladius Traders`;
    this.metaTitle = generatedTitle.length > 200 
      ? generatedTitle.substring(0, 197) + '...' 
      : generatedTitle;
  }
  
  if (this.isModified('description') && !this.metaDescription) {
    const plainDesc = this.description.replace(/<[^>]*>/g, '');
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