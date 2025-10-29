import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';


dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Product Schema (adjust the path to match your project structure)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  brand: { type: String },
  material: { type: String },
  bladeLength: { type: Number },
  images: [{ type: String }],
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  // Additional fields from Excel
  handle: { type: String },
  blade: { type: String },
  lengthBlade: { type: String },
  lengthHandle: { type: String },
  packageWeight: { type: Number },
  casing: { type: String },
  quantity: { type: Number },
  finishing: { type: String },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Complete product data from Excel and Catalog
const productsData = [
  {
    sku: 'YB 01',
    name: 'Chef Knife - Rosewood Handle',
    category: 'chef',
    handle: 'Rosewood',
    blade: '12 c 27 stainless steel',
    lengthBlade: '250',
    lengthHandle: '125',
    packageWeight: 1.17,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 15,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: 9.84, // 250mm to inches
    description: 'Premium chef knife featuring a beautiful Rosewood handle and 12 C 27 stainless steel blade with hammered finish. Perfect balance for professional and home cooking. Includes premium cow leather sheath.',
    featured: true,
    imageFolder: 'YB1', // Corresponds to your image folder
  },
  {
    sku: 'YB 02',
    name: 'Chef Knives Pair - Paddockwood Handle',
    category: 'chef',
    handle: 'Paddockwood',
    blade: '12 c 27 stainless steel',
    lengthBlade: '225/200',
    lengthHandle: '123/120',
    packageWeight: 1.20,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Hammered Finish',
    price: 180,
    stock: 12,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: 8.86,
    description: 'Exceptional chef knife with striking Paddockwood handle and premium stainless steel blade. Hammered finish provides both aesthetics and functionality. Complete with leather sheath for safe storage.',
    featured: true,
    imageFolder: 'YB2',
  },
  {
    sku: 'YB 03',
    name: 'Chef Knife - Paddockwood Handle',
    category: 'chef',
    handle: 'Paddockwood',
    blade: '12 c 27 stainless steel',
    lengthBlade: '246',
    lengthHandle: '127',
    packageWeight: 1.16,
    casing: 'Cow Leather Sheath Black',
    quantity: 2,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 10,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: 9.69,
    description: 'Professional-grade chef knife with elegant Paddockwood handle. Features 12 C 27 stainless steel blade with hammered finish for superior performance and style.',
    featured: false,
    imageFolder: 'YB3',
  },
  {
    sku: 'YB 04',
    name: 'Chef Knife - Brown Rosewood Handle',
    category: 'chef',
    handle: 'Rosewood',
    blade: '12 c 27 stainless steel',
    lengthBlade: '220',
    lengthHandle: '112',
    packageWeight: 0.87,
    casing: 'Cow Leather Sheath Black',
    quantity: 2,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 14,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: 8.66,
    description: 'Classic chef knife with timeless Rosewood handle and high-quality stainless steel blade. Ideal for all kitchen tasks with comfortable grip and excellent balance.',
    featured: false,
    imageFolder: 'YB4',
  },
  {
    sku: 'YB 05',
    name: 'Chef Knife - Wengewood/Paddockwood Handle',
    category: 'chef',
    handle: 'Wendgewood/Paddockwood',
    blade: '12 c 27 stainless steel',
    lengthBlade: '240',
    lengthHandle: '125',
    packageWeight: 0.82,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Hammered Finish',
    price: 130,
    stock: 8,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: 9.45,
    description: 'Unique chef knife featuring a stunning combination of Rosewood and Paddockwood handle. Premium stainless steel blade with hammered finish for exceptional cutting performance.',
    featured: true,
    imageFolder: 'YB5',
  },
  {
    sku: 'YB 06',
    name: 'Bush Craft Knife - Camel Bone Handle',
    category: 'outdoor',
    handle: 'Camel Bone',
    blade: '10/95 high carbon steel',
    lengthBlade: '112',
    lengthHandle: '110',
    packageWeight: 0.85,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Acid wash finish',
    price: 80,
    stock: 20,
    brand: 'Gladius',
    material: '10/95 High Carbon Steel',
    bladeLength: 4.41,
    description: 'Lightweight bushcraft knife with unique Camel Bone handle. High carbon steel blade with acid wash finish. Perfect for outdoor adventures and survival situations.',
    featured: false,
    imageFolder: 'YB6',
  },
  {
    sku: 'YB 07',
    name: 'Bush Craft Knife - Mikarta Black & Parrot Handle',
    category: 'outdoor',
    handle: 'Mikarta Black & Parrot',
    blade: '440 c Stainless Steel',
    lengthBlade: '85',
    lengthHandle: '120',
    packageWeight: 0.80,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 100,
    stock: 15,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: 3.35,
    description: 'Tactical bushcraft knife with striking Mikarta Black & Parrot handle. Premium 440 C stainless steel blade with mirror polish finish for durability and aesthetics.',
    featured: false,
    imageFolder: 'YB7',
  },
  {
    sku: 'YB 08',
    name: 'Bush Craft Knife - Wengewood Handle',
    category: 'outdoor',
    handle: 'Wengewood',
    blade: '440 c Stainless Steel',
    lengthBlade: '96',
    lengthHandle: '110',
    packageWeight: 0.65,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 80,
    stock: 18,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: 3.78,
    description: 'Reliable bushcraft knife with exotic Wengewood handle. Features 440 C stainless steel blade with mirror polish finish for outdoor reliability.',
    featured: false,
    imageFolder: 'YB8',
  },
  {
    sku: 'YB 09',
    name: 'Skinner Knife - Rosewood Handle',
    category: 'hunting',
    handle: 'RoseWood',
    blade: '440 c Stainless Steel',
    lengthBlade: '80',
    lengthHandle: '100',
    packageWeight: 0.59,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 80,
    stock: 12,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: 3.15,
    description: 'Professional skinner knife with beautiful Rosewood handle. Precision 440 C stainless steel blade with mirror polish finish. Essential tool for hunters and outdoorsmen.',
    featured: false,
    imageFolder: 'YB9',
  },
  {
    sku: 'YB 10',
    name: 'Bush Craft Knife - Raisin Handle',
    category: 'outdoor',
    handle: 'Raisin Handle',
    blade: '440 c Stainless Steel',
    lengthBlade: '58',
    lengthHandle: '100',
    packageWeight: 0.63,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 85,
    stock: 10,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: 2.28,
    description: 'Compact bushcraft knife with unique Raisin handle. High-quality 440 C stainless steel blade with mirror polish. Ideal for detailed outdoor work.',
    featured: false,
    imageFolder: 'YB10',
  },
  {
    sku: 'YB 11',
    name: 'Fillet Knife - Camel Bone Handle',
    category: 'hunting',
    handle: 'Camel Bone',
    blade: '12 c 27 stainless steel flexible',
    lengthBlade: '210',
    lengthHandle: '122',
    packageWeight: 0.75,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 85,
    stock: 8,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: 8.27,
    description: 'Premium fillet knife with Camel Bone handle. Flexible 12 C 27 stainless steel blade perfect for precision filleting. Mirror polish finish ensures smooth cutting.',
    featured: false,
    imageFolder: 'YB11',
  },
  {
    sku: 'YB 13',
    name: 'Bush Craft Edgy Knife - Camel Bone Handle',
    category: 'outdoor',
    handle: 'Camel Bone',
    blade: '10/95 high carbon steel',
    lengthBlade: '110',
    lengthHandle: '115',
    packageWeight: 0.80,
    casing: 'Cow Leather Sheath Black',
    quantity: 2,
    finishing: 'Acid wash finish',
    price: 65,
    stock: 16,
    brand: 'Gladius',
    material: '10/95 High Carbon Steel',
    bladeLength: 4.33,
    description: 'Durable bushcraft knife with Camel Bone handle. High carbon steel blade with acid wash finish for corrosion resistance and unique appearance.',
    featured: false,
    imageFolder: 'YB13',
  },
  {
    sku: 'YB 14',
    name: 'Loveless Knife - Camel Bone Handle',
    category: 'tactical',
    handle: 'Camel Bone',
    blade: '440 c Stainless Steel',
    lengthBlade: '75',
    lengthHandle: '120',
    packageWeight: 0.60,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 60,
    stock: 14,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: 2.95,
    description: 'Classic Loveless design with Camel Bone handle. Premium 440 C stainless steel blade with mirror polish. Perfect for everyday carry and tactical use.',
    featured: false,
    imageFolder: 'YB14',
  },
  {
    sku: 'YB 15',
    name: 'Bush Craft Knife - Paddockwood Handle',
    category: 'outdoor',
    handle: 'Paddockwood',
    blade: '440 c Stainless Steel',
    lengthBlade: '130',
    lengthHandle: '122',
    packageWeight: 0.94,
    casing: 'Cow Leather Sheath Black',
    quantity: 1,
    finishing: 'Mirror Polish',
    price: 80,
    stock: 6,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: 5.12,
    description: 'Robust bushcraft knife with premium Paddockwood handle. Features 440 C stainless steel blade with mirror polish finish for outdoor reliability.',
    featured: false,
    imageFolder: 'YB15',
  },
  {
    sku: 'YB 16',
    name: 'Loveless Knife - Wengewood Handle',
    category: 'tactical',
    handle: 'Wengewood',
    blade: '440 c Stainless Steel',
    lengthBlade: '100',
    lengthHandle: '112',
    packageWeight: 0.79,
    casing: 'Cow Leather Sheath Black',
    quantity: 2,
    finishing: 'Mirror Polish',
    price: 85,
    stock: 9,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: 3.94,
    description: 'Timeless Loveless knife with exotic Wengewood handle. High-quality 440 C stainless steel blade with mirror polish. Excellent for tactical and everyday use.',
    featured: true,
    imageFolder: 'YB16',
  },
  {
    sku: 'YB 17',
    name: 'Loveless Knife - Rosewood Handle',
    category: 'tactical',
    handle: 'Rosewood',
    blade: '440 c Stainless Steel',
    lengthBlade: '100',
    lengthHandle: '112',
    packageWeight: 0.77,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 60,
    stock: 18,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: 3.94,
    description: 'Beautiful Loveless knife with classic Rosewood handle. Premium stainless steel blade with mirror polish finish. Perfect for collectors and everyday carry.',
    featured: false,
    imageFolder: 'YB17',
  },
  {
    sku: 'YB 18',
    name: 'Bush Craft Knife - Rosewood Handle',
    category: 'outdoor',
    handle: 'Rosewood',
    blade: '440 c Stainless Steel',
    lengthBlade: '100',
    lengthHandle: '110',
    packageWeight: 0.78,
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 80,
    stock: 13,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: 3.94,
    description: 'Versatile bushcraft knife with elegant Rosewood handle. Features 440 C stainless steel blade with mirror polish for outdoor adventures.',
    featured: false,
    imageFolder: 'YB18',
  },
  {
    sku: 'YB 19',
    name: 'Loveless Knife - Mikarta Black Handle',
    category: 'tactical',
    handle: 'Mikarta Black',
    blade: '440 c Stainless',
    lengthBlade: '82',
    lengthHandle: '100',
    packageWeight: 0.82,
    casing: 'Cow Leather Sheath',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 85,
    stock: 11,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: 3.23,
    description: 'Tactical Loveless knife with durable Mikarta Black handle. Premium 440 C stainless steel blade with mirror polish for tactical reliability.',
    featured: false,
    imageFolder: 'YB19',
  },
  {
    sku: 'YB 20',
    name: 'Chopper Knife - Rosewood Handle',
    category: 'chef',
    handle: 'Rosewood',
    blade: '12 c 27 stainless steel',
    lengthBlade: '200',
    lengthHandle: '120',
    packageWeight: 0.91,
    casing: 'Wooden casing taraik',
    quantity: 3,
    finishing: 'Mirror Finish',
    price: 120,
    stock: 7,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: 7.87,
    description: 'Heavy-duty chopper knife with beautiful Rosewood handle. Premium 12 C 27 stainless steel blade with mirror finish. Comes with elegant wooden casing.',
    featured: true,
    imageFolder: 'YB20',
  },
];

// Function to generate slug
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Function to upload images to Cloudinary
async function uploadImagesToCloudinary(imageFolder, productName) {
  const images = [];
  const imageFolderPath = path.join(process.cwd(), 'images', imageFolder);
  
  try {
    // Check if folder exists
    if (!fs.existsSync(imageFolderPath)) {
      console.log(`⚠️  Folder not found: ${imageFolderPath}`);
      return images;
    }

    // Read all files in the folder
    const files = fs.readdirSync(imageFolderPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    console.log(`   Found ${imageFiles.length} images in ${imageFolder}`);

    // Upload each image
    for (const file of imageFiles) {
      const filePath = path.join(imageFolderPath, file);
      
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: `gladius-knives/${imageFolder}`,
          public_id: file.split('.')[0],
          overwrite: true,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
          ]
        });
        
        images.push(result.secure_url);
        console.log(`   ✓ Uploaded: ${file}`);
      } catch (uploadError) {
        console.error(`   ✗ Failed to upload ${file}:`, uploadError.message);
      }
    }
  } catch (error) {
    console.error(`   Error processing folder ${imageFolder}:`, error.message);
  }

  return images;
}

// Main seed function
async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gladius-mern';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Clear existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`✓ Cleared ${deleteResult.deletedCount} existing products\n`);

    // Process each product
    const processedProducts = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < productsData.length; i++) {
      const product = productsData[i];
      console.log(`[${i + 1}/${productsData.length}] Processing: ${product.sku} - ${product.name}`);
      
      try {
        // Upload images to Cloudinary
        const images = await uploadImagesToCloudinary(
          product.imageFolder,
          product.name
        );
        
        // Create product object
        const productToSave = {
          name: product.name,
          slug: generateSlug(product.name),
          category: product.category,
          handle: product.handle,
          blade: product.blade,
          lengthBlade: product.lengthBlade,
          lengthHandle: product.lengthHandle,
          packageWeight: product.packageWeight,
          casing: product.casing,
          quantity: product.quantity,
          finishing: product.finishing,
          price: product.price,
          stock: product.stock,
          brand: product.brand,
          material: product.material,
          bladeLength: product.bladeLength,
          description: product.description,
          images: images.length > 0 ? images : [],
          featured: product.featured,
          rating: 0,
          numReviews: 0,
        };
        
        processedProducts.push(productToSave);
        successCount++;
        console.log(`   ✓ Prepared with ${images.length} images\n`);
      } catch (error) {
        failCount++;
        console.error(`   ✗ Error processing ${product.sku}:`, error.message, '\n');
      }
    }

    // Insert all products into database
    if (processedProducts.length > 0) {
      const insertedProducts = await Product.insertMany(processedProducts);
      console.log(`\n✓ Successfully inserted ${insertedProducts.length} products into database\n`);

      // Display summary
      console.log('═══════════════════════════════════════');
      console.log('         SEEDING SUMMARY');
      console.log('═══════════════════════════════════════');
      console.log(`Total products processed: ${productsData.length}`);
      console.log(`Successfully seeded: ${successCount}`);
      console.log(`Failed: ${failCount}`);
      console.log(`Featured products: ${insertedProducts.filter(p => p.featured).length}`);
      console.log('\nProducts by category:');
      
      const categories = [...new Set(insertedProducts.map(p => p.category))];
      categories.forEach(cat => {
        const count = insertedProducts.filter(p => p.category === cat).length;
        const categoryName = cat.charAt(0).toUpperCase() + cat.slice(1);
        console.log(`  • ${categoryName}: ${count} products`);
      });

      console.log('\nPrice range:');
      const prices = insertedProducts.map(p => p.price);
      console.log(`  • Min: $${Math.min(...prices)}`);
      console.log(`  • Max: $${Math.max(...prices)}`);
      console.log(`  • Average: $${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}`);
      
      console.log('\nTotal stock available:', insertedProducts.reduce((sum, p) => sum + p.stock, 0));
      console.log('═══════════════════════════════════════\n');
    }

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    console.log('\n🎉 Seeding completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
console.log('═══════════════════════════════════════');
console.log('   GLADIUS KNIFE PRODUCTS SEEDER');
console.log('═══════════════════════════════════════\n');

seedDatabase();

/*
 * ═══════════════════════════════════════════════════════════════
 *                    USAGE INSTRUCTIONS
 * ═══════════════════════════════════════════════════════════════
 * 
 * 1. SETUP ENVIRONMENT VARIABLES (.env file):
 *    MONGODB_URI=mongodb://localhost:27017/gladius-mern
 *    CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 * 
 * 2. FOLDER STRUCTURE:
 *    Place this seed.js file in your project root (or server folder)
 *    Ensure your images are organized like this:
 *    
 *    project-root/
 *    ├── seed.js
 *    └── images/
 *        ├── YB-1/
 *        │   ├── image1.jpg
 *        │   └── image2.jpg
 *        ├── YB-2/
 *        │   └── image1.jpg
 *        └── ...
 * 
 * 3. INSTALL DEPENDENCIES:
 *    npm install mongoose dotenv cloudinary
 * 
 * 4. RUN THE SEEDER:
 *    node seed.js
 * 
 * 5. NOTES:
 *    - Images will be uploaded to Cloudinary in folders like:
 *      gladius-knives/YB-1/, gladius-knives/YB-2/, etc.
 *    - All measurements from Excel are preserved
 *    - Stock levels are set based on quantity data
 *    - Featured products are marked for homepage display
 *    - All knife specifications match the Excel sheet exactly
 * 
 * ═══════════════════════════════════════════════════════════════
 */