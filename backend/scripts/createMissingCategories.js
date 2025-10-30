import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

const createCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔧 Creating missing categories...\n');
    
    const categories = [
      {
        name: 'Bushcraft',
        slug: 'bushcraft',
        description: 'Durable bushcraft and outdoor survival knives'
      },
      {
        name: 'Tactical',
        slug: 'tactical',
        description: 'Tactical and military-style knives including Loveless designs'
      }
    ];
    
    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug });
      
      if (!existing) {
        await Category.create(cat);
        console.log(`✅ Created: ${cat.name}`);
      } else {
        console.log(`⏭️  Already exists: ${cat.name}`);
      }
    }
    
    console.log('\n🎉 Done!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createCategories();