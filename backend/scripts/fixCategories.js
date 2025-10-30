import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const productSchema = new mongoose.Schema({
  name: String,
  category: mongoose.Schema.Types.Mixed, // Accept any type temporarily
  slug: String,
}, { strict: false });

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String
});

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);

const fixCategories = async () => {
  try {
    console.log('🔧 Fixing category references...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const products = await Product.find({});
    let fixed = 0;
    
    for (const product of products) {
      // Skip if already ObjectId
      if (mongoose.Types.ObjectId.isValid(product.category) && 
          product.category.toString().length === 24) {
        console.log(`✅ ${product.name} - Already correct`);
        continue;
      }
      
      // Find category by name or slug
      const categoryStr = String(product.category);
      const categoryMap = {
  'outdoor': 'Bushcraft',
  'tactical': 'Tactical',
  'chef': 'Chef',
  'hunting': 'Hunting'
};

        const mappedName = categoryMap[categoryStr.toLowerCase()] || categoryStr;
        const category = await Category.findOne({
        $or: [
          { name: new RegExp(mappedName, 'i') },
          { slug: mappedName.toLowerCase() }
        ]
      });
      
      if (category) {
        product.category = category._id;
        await product.save();
        console.log(`✅ ${product.name} - Fixed (${categoryStr} → ${category.name})`);
        fixed++;
      } else {
        console.log(`⚠️  ${product.name} - No matching category found for "${categoryStr}"`);
      }
    }
    
    console.log(`\n🎉 Fixed ${fixed} products!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixCategories();