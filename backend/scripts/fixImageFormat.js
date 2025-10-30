import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Load from backend/.env

// Define Product schema inline
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  price: Number,
  description: String,
  countInStock: Number,
  category: String,
  brand: String,
  material: String,
  bladeLength: String,
  images: [mongoose.Schema.Types.Mixed], // Allow any type
  isFeatured: Boolean,
  rating: Number,
  numReviews: Number,
  handle: String,
  blade: String,
  lengthBlade: String,
  lengthHandle: String,
  packageWeight: Number,
  casing: String,
  finishing: String,
  sku: String,
  metaTitle: String,
  metaDescription: String,
  imageAlt: String,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function fixImageFormat() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check\n`);

    let fixedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const fixedImages = [];

      console.log(`\n📦 Checking: ${product.name}`);
      console.log(`   Current image count: ${product.images?.length || 0}`);

      if (product.images && Array.isArray(product.images)) {
        for (const image of product.images) {
          // Check if image is a broken object (character array)
          if (typeof image === 'object' && image !== null && typeof image[0] === 'string') {
            // Reconstruct URL from character array
            const keys = Object.keys(image).filter(k => !isNaN(k)).sort((a, b) => Number(a) - Number(b));
            const url = keys.map(k => image[k]).join('');
            fixedImages.push(url);
            needsUpdate = true;
            console.log(`   ✅ Fixed broken image`);
          } else if (typeof image === 'string') {
            // Already correct
            fixedImages.push(image);
            console.log(`   ✓ String image OK`);
          } else if (image && image.url) {
            // Has url property
            fixedImages.push(image.url);
            needsUpdate = true;
            console.log(`   ✅ Extracted from .url property`);
          } else {
            console.log(`   ⚠️  Skipped unknown format:`, typeof image);
          }
        }
      }

      if (needsUpdate && fixedImages.length > 0) {
        product.images = fixedImages;
        await product.save();
        fixedCount++;
        console.log(`   💾 SAVED with ${fixedImages.length} images`);
      } else if (fixedImages.length > 0) {
        console.log(`   ⏭️  No changes needed (${fixedImages.length} images OK)`);
      } else {
        console.log(`   ⚠️  No valid images found`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Migration complete!`);
    console.log(`   Total products: ${products.length}`);
    console.log(`   Fixed products: ${fixedCount}`);
    console.log('='.repeat(60) + '\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixImageFormat();