import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

/**
 * This script populates the specifications object from top-level fields
 * Run this ONCE after updating the Product model to ensure all products
 * have their specifications properly structured
 */

async function populateSpecifications() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      console.log(`Processing: ${product.name} (${product.sku || product._id})`);
      
      let needsUpdate = false;
      const specs = product.specifications || {};

      // Map top-level fields to specifications object
      if (product.blade && !specs.bladeMaterial) {
        specs.bladeMaterial = product.blade;
        needsUpdate = true;
      }

      if (product.lengthBlade && !specs.bladeLength) {
        specs.bladeLength = product.lengthBlade;
        needsUpdate = true;
      }

      if (product.handle && !specs.handleMaterial) {
        specs.handleMaterial = product.handle;
        needsUpdate = true;
      }

      if (product.lengthHandle && !specs.totalLength) {
        const totalLength = `${product.lengthBlade || 'N/A'} blade + ${product.lengthHandle} handle`;
        specs.totalLength = totalLength;
        needsUpdate = true;
      }

      if (product.packageWeight && !specs.weight) {
        specs.weight = `${product.packageWeight}g (${(product.packageWeight / 28.35).toFixed(2)} oz)`;
        needsUpdate = true;
      }

      if (product.finishing && !specs.bladeStyle) {
        specs.bladeStyle = product.finishing;
        needsUpdate = true;
      }

      // Add origin if not present
      if (!specs.origin) {
        specs.origin = 'Wazirabad, Pakistan';
        needsUpdate = true;
      }

      if (needsUpdate) {
        product.specifications = specs;
        await product.save();
        updated++;
        console.log('  ✅ Updated specifications');
      } else {
        skipped++;
        console.log('  ⏭️  Specifications already complete');
      }
      
      console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log('           MIGRATION COMPLETE');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Updated: ${updated} products`);
    console.log(`⏭️  Skipped: ${skipped} products`);
    console.log(`📦 Total: ${products.length} products\n`);

    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

populateSpecifications();

/*
 * USAGE:
 * 
 * 1. Save this file as: backend/populateSpecifications.js
 * 
 * 2. Make sure your .env has MONGODB_URI
 * 
 * 3. Run from backend folder:
 *    node populateSpecifications.js
 * 
 * This will:
 * - Read all existing products
 * - Copy top-level spec fields to specifications object
 * - Add missing default values (like origin)
 * - Skip products that already have complete specifications
 */