import mongoose from 'mongoose';
import Category from '../models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
  { name: 'Hunting', description: 'Hunting and outdoor knives' },
  { name: 'Chef', description: 'Professional chef knives' },
  { name: 'Bushcraft', description: 'Bushcraft and survival knives' },
  { name: 'Skinner', description: 'Skinning and field dressing knives' },
  { name: 'Loveless', description: 'Loveless style knives' },
  { name: 'Chopper', description: 'Chopping and heavy duty knives' },
  { name: 'Fillet', description: 'Fillet and fishing knives' }
];

const createCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const catData of categories) {
      const exists = await Category.findOne({ name: catData.name });
      if (!exists) {
        const category = await Category.create(catData);
        console.log(`✅ Created category: ${category.name} (slug: ${category.slug})`);
      } else {
        console.log(`⚠️ Category already exists: ${catData.name}`);
      }
    }

    console.log('🎉 All categories created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating categories:', error);
    process.exit(1);
  }
};

createCategories();