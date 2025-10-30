import mongoose from 'mongoose';

export const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true,
  },
  image: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // SEO Meta Fields for Category Pages
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  metaKeywords: [String],
  // Canonical URL for category
  canonicalUrl: String,
}, {
  timestamps: true,
});

// Auto-generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Auto-generate meta title if not provided
  if (this.isModified('name') && !this.metaTitle) {
    this.metaTitle = `${this.name} Knives | Handcrafted in Wazirabad | Gladius Traders`;
  }
  
  // Auto-generate meta description if not provided
  if (this.isModified('description') && !this.metaDescription) {
    const plainDesc = this.description?.replace(/<[^>]*>/g, '') || '';
    this.metaDescription = plainDesc.length > 0
      ? (plainDesc.length > 160 ? plainDesc.substring(0, 157) + '...' : plainDesc)
      : `Browse our collection of handcrafted ${this.name} knives from Wazirabad, Pakistan. Premium quality, traditional craftsmanship.`;
  }
  
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;