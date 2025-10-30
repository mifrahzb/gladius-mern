import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Generate SEO-friendly slug
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Product Schema (inline for migration)
 */
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  richDescription: String,
  price: Number,
  countInStock: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: String,
  image: String,
  images: [mongoose.Schema.Types.Mixed],
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  focusKeyword: String,
  imageAlts: [{
    imageUrl: String,
    altText: String
  }],
  canonicalUrl: String,
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  isFeatured: Boolean,
  rating: Number,
  numReviews: Number,
  specifications: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

/**
 * Category Schema (inline for migration)
 */
const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  canonicalUrl: String,
  isActive: Boolean
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

/**
 * Migrate existing products to include SEO fields
 */
const migrateSEO = async () => {
  try {
    console.log('🔄 Starting SEO Migration...\n');
    console.log('🔌 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables!');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // ===== MIGRATE PRODUCTS =====
    console.log('📦 Fetching all products...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const product of products) {
      console.log(`\n📦 Processing: ${product.name}`);
      let hasChanges = false;
      
      // Get category for context
      const category = await Category.findById(product.category);
      const categoryName = category?.name || 'Knife';
      const categorySlug = category?.slug || 'knives';
      
      // Generate slug if missing
      if (!product.slug) {
        product.slug = generateSlug(product.name);
        console.log(`   ✏️  Generated slug: ${product.slug}`);
        hasChanges = true;
      }
      
      // Generate meta title if missing
      if (!product.metaTitle) {
        product.metaTitle = `${product.name} | Gladius Traders`;
        console.log(`   ✏️  Generated meta title`);
        hasChanges = true;
      }
      
      // Generate meta description if missing
      if (!product.metaDescription) {
        const plainDesc = product.description?.replace(/<[^>]*>/g, '') || '';
        product.metaDescription = plainDesc.length > 160 
          ? plainDesc.substring(0, 157) + '...' 
          : plainDesc || `Handcrafted ${product.name} from Wazirabad, Pakistan. Premium quality, traditional craftsmanship.`;
        console.log(`   ✏️  Generated meta description`);
        hasChanges = true;
      }
      
      // Set rich description from description if missing
      if (!product.richDescription && product.description) {
        product.richDescription = product.description;
        console.log(`   ✏️  Set rich description`);
        hasChanges = true;
      }
      
      // Generate image alt text if missing
      if (!product.imageAlts || product.imageAlts.length === 0) {
        const imageUrl = typeof product.images?.[0] === 'string' 
          ? product.images[0] 
          : product.images?.[0]?.url || product.image;
          
        product.imageAlts = [{
          imageUrl: imageUrl,
          altText: `${product.name} - Handcrafted ${categoryName} from Wazirabad, Pakistan`
        }];
        console.log(`   ✏️  Generated image alt text`);
        hasChanges = true;
      }
      
      // Set canonical URL if missing
      if (!product.canonicalUrl) {
        product.canonicalUrl = `/product/${categorySlug}/${product.slug}`;
        console.log(`   ✏️  Set canonical URL: ${product.canonicalUrl}`);
        hasChanges = true;
      }
      
      // Set focus keyword if missing
      if (!product.focusKeyword) {
        product.focusKeyword = product.name;
        console.log(`   ✏️  Set focus keyword`);
        hasChanges = true;
      }
      
      // Set Open Graph fields if missing
      if (!product.ogTitle) {
        product.ogTitle = product.name;
        hasChanges = true;
      }
      
      if (!product.ogDescription) {
        product.ogDescription = product.metaDescription;
        hasChanges = true;
      }
      
      if (!product.ogImage) {
        const imageUrl = typeof product.images?.[0] === 'string' 
          ? product.images[0] 
          : product.images?.[0]?.url || product.image;
        product.ogImage = imageUrl;
        hasChanges = true;
      }
      
      // Save if there are changes
      if (hasChanges) {
        await product.save();
        console.log(`   ✅ Updated successfully`);
        updated++;
      } else {
        console.log(`   ⏭️  No changes needed`);
        skipped++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Product Migration Complete!');
    console.log('='.repeat(50));
    console.log(`✅ Updated: ${updated} products`);
    console.log(`⏭️  Skipped: ${skipped} products`);
    console.log(`📊 Total: ${products.length} products`);
    console.log('='.repeat(50) + '\n');
    
    // ===== MIGRATE CATEGORIES =====
    console.log('\n📁 Migrating categories...\n');
    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories\n`);
    
    let categoriesUpdated = 0;
    
    for (const category of categories) {
      console.log(`\n📂 Processing category: ${category.name}`);
      let hasChanges = false;
      
      // Generate slug if missing
      if (!category.slug) {
        category.slug = generateSlug(category.name);
        console.log(`   ✏️  Generated slug: ${category.slug}`);
        hasChanges = true;
      }
      
      // Generate meta title if missing
      if (!category.metaTitle) {
        category.metaTitle = `${category.name} Knives | Handcrafted in Wazirabad | Gladius Traders`;
        console.log(`   ✏️  Generated meta title`);
        hasChanges = true;
      }
      
      // Generate meta description if missing
      if (!category.metaDescription) {
        category.metaDescription = `Browse our collection of handcrafted ${category.name} knives from Wazirabad, Pakistan. Premium quality, traditional craftsmanship.`;
        console.log(`   ✏️  Generated meta description`);
        hasChanges = true;
      }
      
      if (hasChanges) {
        await category.save();
        console.log(`   ✅ Updated successfully`);
        categoriesUpdated++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📁 Category Migration Complete!');
    console.log('='.repeat(50));
    console.log(`✅ Updated: ${categoriesUpdated} categories`);
    console.log('='.repeat(50) + '\n');
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
    
    console.log('✨ MIGRATION SUCCESSFUL! ✨\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration Error:', error);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
};

// Run migration
console.log('\n' + '='.repeat(50));
console.log('🚀 SEO MIGRATION SCRIPT');
console.log('='.repeat(50) + '\n');

migrateSEO();