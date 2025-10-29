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

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  countInStock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  brand: { type: String, default: 'Gladius' },
  material: { type: String },
  bladeLength: { type: String },
  images: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  // Additional fields from Excel
  handle: { type: String },
  blade: { type: String },
  lengthBlade: { type: String },
  lengthHandle: { type: String },
  packageWeight: { type: Number }, // in grams
  casing: { type: String },
  finishing: { type: String },
  sku: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  imageAlt: { type: String },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Complete product data from Excel and both Catalogs
const productsData = [
  // ========== YB-1 Chef Knife - Rosewood Handle ==========
  {
    sku: 'YB-1',
    name: 'Professional Chef Knife - Rosewood Handle',
    slug: 'professional-chef-knife-rosewood-handle-yb1',
    category: 'chef',
    handle: 'Rosewood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '250mm',
    lengthHandle: '125mm',
    packageWeight: 1170, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 15,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.84 inches',
    description: 'Premium chef knife featuring a beautiful Rosewood handle and 12 C 27 stainless steel blade with hammered finish. Perfect balance for professional and home cooking. The 250mm blade provides excellent cutting performance for all kitchen tasks. Includes premium cow leather sheath for safe storage and transport.',
    isFeatured: true,
    imageFolder: 'YB1',
  },

  // ========== YB-2 Chef Knives Pair - Paddockwood Handle ==========
  {
    sku: 'YB-2',
    name: 'Premium Chef Knives Pair - Paddockwood Handle',
    slug: 'premium-chef-knives-pair-paddockwood-handle-yb2',
    category: 'chef',
    handle: 'Paddockwood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '225mm / 200mm',
    lengthHandle: '123mm / 120mm',
    packageWeight: 1200, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Hammered Finish',
    price: 180,
    stock: 12,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '8.86 inches / 7.87 inches',
    description: 'Exceptional chef knife set with striking Paddockwood handles and premium stainless steel blades. Hammered finish provides both aesthetics and functionality, reducing friction while cutting. Complete with leather sheaths for safe storage. Perfect for professional chefs and serious home cooks.',
    isFeatured: true,
    imageFolder: 'YB2',
  },

  // ========== YB-3 Chef Knife - Paddockwood Handle ==========
  {
    sku: 'YB-3',
    name: 'Chef Knife - Paddockwood Handle',
    slug: 'chef-knife-paddockwood-handle-yb3',
    category: 'chef',
    handle: 'Paddockwood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '246mm',
    lengthHandle: '127mm',
    packageWeight: 1160, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 2,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 10,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.69 inches',
    description: 'Professional-grade chef knife with elegant Paddockwood handle. Features 12 C 27 stainless steel blade with hammered finish for superior performance and style. The 246mm blade length offers excellent versatility for all cutting tasks. Perfect for slicing, dicing, and chopping.',
    isFeatured: false,
    imageFolder: 'YB3',
  },

  // ========== YB-4 Chef Knife - Brown Rosewood Handle ==========
  {
    sku: 'YB-4',
    name: 'Classic Chef Knife - Brown Rosewood Handle',
    slug: 'classic-chef-knife-brown-rosewood-handle-yb4',
    category: 'chef',
    handle: 'Rosewood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '220mm',
    lengthHandle: '112mm',
    packageWeight: 870, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 2,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 14,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '8.66 inches',
    description: 'Classic chef knife with timeless Rosewood handle and high-quality stainless steel blade. Ideal for all kitchen tasks with comfortable grip and excellent balance. The hammered finish reduces food sticking while cutting. Perfect weight distribution for extended use without fatigue.',
    isFeatured: false,
    imageFolder: 'YB4',
  },

  // ========== YB-5 Chef Knife - Wengewood/Paddockwood Handle ==========
  {
    sku: 'YB-5',
    name: 'Chef Knife - Wengewood & Paddockwood Handle',
    slug: 'chef-knife-wengewood-paddockwood-handle-yb5',
    category: 'chef',
    handle: 'Wengewood/Paddockwood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '240mm',
    lengthHandle: '125mm',
    packageWeight: 820, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Hammered Finish',
    price: 130,
    stock: 8,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.45 inches',
    description: 'Unique chef knife featuring a stunning combination of Wengewood and Paddockwood handle. Premium stainless steel blade with hammered finish for exceptional cutting performance. The mixed wood handle provides both beauty and excellent grip. Comes with premium leather sheath.',
    isFeatured: true,
    imageFolder: 'YB5',
  },

  // ========== YB-6 Bush Craft Knife - Camel Bone Handle ==========
  {
    sku: 'YB-6',
    name: 'Bush Craft Knife - Camel Bone Handle',
    slug: 'bush-craft-knife-camel-bone-handle-yb6',
    category: 'outdoor',
    handle: 'Camel Bone',
    blade: '10/95 High Carbon Steel',
    lengthBlade: '112mm',
    lengthHandle: '110mm',
    packageWeight: 850, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Acid Wash Finish',
    price: 80,
    stock: 20,
    brand: 'Gladius',
    material: '10/95 High Carbon Steel',
    bladeLength: '4.41 inches',
    description: 'Lightweight bushcraft knife with unique Camel Bone handle. High carbon steel blade with acid wash finish provides excellent edge retention and corrosion resistance. Perfect for outdoor adventures and survival situations. Compact size makes it ideal for camping, hiking, and bushcraft activities.',
    isFeatured: false,
    imageFolder: 'YB6',
  },

  // ========== YB-7 Bush Craft Knife - Mikarta Black & Parrot Handle ==========
  {
    sku: 'YB-7',
    name: 'Bush Craft Knife - Mikarta Black & Parrot Handle',
    slug: 'bush-craft-knife-mikarta-black-parrot-handle-yb7',
    category: 'outdoor',
    handle: 'Mikarta Black & Parrot',
    blade: '440 C Stainless Steel',
    lengthBlade: '85mm',
    lengthHandle: '120mm',
    packageWeight: 800, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 100,
    stock: 15,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: '3.35 inches',
    description: 'Tactical bushcraft knife with striking Mikarta Black & Parrot handle. Premium 440 C stainless steel blade with mirror polish finish for durability and aesthetics. The Mikarta handle provides excellent grip even in wet conditions. Ideal for tactical use and outdoor adventures.',
    isFeatured: false,
    imageFolder: 'YB7',
  },

  // ========== YB-8 Bush Craft Knife - Wengewood Handle ==========
  {
    sku: 'YB-8',
    name: 'Bush Craft Knife - Wengewood Handle',
    slug: 'bush-craft-knife-wengewood-handle-yb8',
    category: 'outdoor',
    handle: 'Wengewood',
    blade: '440 C Stainless Steel',
    lengthBlade: '96mm',
    lengthHandle: '110mm',
    packageWeight: 650, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 65,
    stock: 18,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: '3.78 inches',
    description: 'Reliable bushcraft knife with exotic Wengewood handle. Features 440 C stainless steel blade with mirror polish finish for outdoor reliability. The dense Wengewood provides durability and comfortable grip. Perfect for camping, survival tasks, and everyday outdoor use.',
    isFeatured: false,
    imageFolder: 'YB8',
  },

  // ========== YB-9 Skinner Knife - Rosewood Handle ==========
  {
    sku: 'YB-9',
    name: 'Professional Skinner Knife - Rosewood Handle',
    slug: 'professional-skinner-knife-rosewood-handle-yb9',
    category: 'hunting',
    handle: 'Rosewood',
    blade: '440 C Stainless Steel',
    lengthBlade: '80mm',
    lengthHandle: '100mm',
    packageWeight: 590, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 80,
    stock: 12,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: '3.15 inches',
    description: 'Professional skinner knife with beautiful Rosewood handle. Precision 440 C stainless steel blade with mirror polish finish. Essential tool for hunters and outdoorsmen. The curved blade design allows for precise skinning and field dressing. Includes premium leather sheath.',
    isFeatured: false,
    imageFolder: 'YB9',
  },

  // ========== YB-10 Bush Craft Knife - Raisin Handle ==========
  {
    sku: 'YB-10',
    name: 'Bush Craft Knife - Resin Handle',
    slug: 'bush-craft-knife-resin-handle-yb10',
    category: 'outdoor',
    handle: 'Resin Handle',
    blade: '440 C Stainless Steel',
    lengthBlade: '58mm',
    lengthHandle: '100mm',
    packageWeight: 630, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 85,
    stock: 10,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: '2.28 inches',
    description: 'Compact bushcraft knife with unique colorful Resin handle. High-quality 440 C stainless steel blade with mirror polish. Ideal for detailed outdoor work and everyday carry. The striking resin handle is both durable and visually appealing. Perfect size for precision tasks.',
    isFeatured: false,
    imageFolder: 'YB10',
  },

  // ========== YB-11 Fillet Knife - Camel Bone Handle ==========
  {
    sku: 'YB-11',
    name: 'Professional Fillet Knife - Camel Bone Handle',
    slug: 'professional-fillet-knife-camel-bone-handle-yb11',
    category: 'hunting',
    handle: 'Camel Bone',
    blade: '12 C 27 Stainless Steel Flexible',
    lengthBlade: '210mm',
    lengthHandle: '122mm',
    packageWeight: 750, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 85,
    stock: 8,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '8.27 inches',
    description: 'Premium fillet knife with Camel Bone handle. Flexible 12 C 27 stainless steel blade perfect for precision filleting. Mirror polish finish ensures smooth cutting through fish and meat. The flexible blade allows for precise cuts along bones. Essential tool for anglers and hunters.',
    isFeatured: false,
    imageFolder: 'YB11',
  },

  // ========== YB-13 Bush Craft Edgy Knife - Camel Bone Handle ==========
  {
    sku: 'YB-13',
    name: 'Bush Craft Edgy Knife - Camel Bone Handle',
    slug: 'bush-craft-edgy-knife-camel-bone-handle-yb13',
    category: 'outdoor',
    handle: 'Camel Bone',
    blade: '10/95 High Carbon Steel',
    lengthBlade: '110mm',
    lengthHandle: '115mm',
    packageWeight: 800, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 2,
    finishing: 'Acid Wash Finish',
    price: 65,
    stock: 16,
    brand: 'Gladius',
    material: '10/95 High Carbon Steel',
    bladeLength: '4.33 inches',
    description: 'Durable bushcraft knife with Camel Bone handle and edgy design. High carbon steel blade with acid wash finish for corrosion resistance and unique appearance. Perfect for heavy-duty outdoor tasks. The robust construction makes it ideal for batoning and chopping.',
    isFeatured: false,
    imageFolder: 'YB13',
  },

  // ========== YB-14 Loveless Knife - Camel Bone Handle ==========
  {
    sku: 'YB-14',
    name: 'Loveless Style Knife - Camel Bone Handle',
    slug: 'loveless-style-knife-camel-bone-handle-yb14',
    category: 'tactical',
    handle: 'Camel Bone',
    blade: '440 C Stainless Steel',
    lengthBlade: '75mm',
    lengthHandle: '120mm',
    packageWeight: 600, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 60,
    stock: 14,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: '2.95 inches',
    description: 'Classic Loveless design with Camel Bone handle. Premium 440 C stainless steel blade with mirror polish. Perfect for everyday carry and tactical use. The iconic drop-point blade shape provides excellent versatility. Compact size makes it ideal for various cutting tasks.',
    isFeatured: false,
    imageFolder: 'YB14',
  },

  // ========== YB-15 Bush Craft Knife - Paddockwood Handle ==========
  {
    sku: 'YB-15',
    name: 'Bush Craft Knife - Paddockwood Handle',
    slug: 'bush-craft-knife-paddockwood-handle-yb15',
    category: 'outdoor',
    handle: 'Paddockwood',
    blade: '440 C Stainless Steel',
    lengthBlade: '130mm',
    lengthHandle: '122mm',
    packageWeight: 940, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 1,
    finishing: 'Mirror Polish',
    price: 80,
    stock: 6,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: '5.12 inches',
    description: 'Robust bushcraft knife with premium Paddockwood handle. Features 440 C stainless steel blade with mirror polish finish for outdoor reliability. Larger blade size perfect for heavy-duty tasks. The beautiful wood grain pattern makes each knife unique.',
    isFeatured: false,
    imageFolder: 'YB15',
  },

  // ========== YB-16 Loveless Knife - Wengewood Handle ==========
  {
    sku: 'YB-16',
    name: 'Loveless Style Knife - Wengewood Handle',
    slug: 'loveless-style-knife-wengewood-handle-yb16',
    category: 'tactical',
    handle: 'Wengewood',
    blade: '440 C Stainless Steel',
    lengthBlade: '100mm',
    lengthHandle: '112mm',
    packageWeight: 790, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 2,
    finishing: 'Mirror Polish',
    price: 85,
    stock: 9,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: '3.94 inches',
    description: 'Timeless Loveless knife with exotic Wengewood handle. High-quality 440 C stainless steel blade with mirror polish. Excellent for tactical and everyday use. The drop-point blade provides excellent control and versatility. Dense wood handle ensures durability.',
    isFeatured: true,
    imageFolder: 'YB16',
  },

  // ========== YB-17 Loveless Knife - Rosewood Handle ==========
  {
    sku: 'YB-17',
    name: 'Loveless Style Knife - Rosewood Handle',
    slug: 'loveless-style-knife-rosewood-handle-yb17',
    category: 'tactical',
    handle: 'Rosewood',
    blade: '440 C Stainless Steel',
    lengthBlade: '100mm',
    lengthHandle: '112mm',
    packageWeight: 770, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 60,
    stock: 18,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: '3.94 inches',
    description: 'Beautiful Loveless knife with classic Rosewood handle. Premium stainless steel blade with mirror polish finish. Perfect for collectors and everyday carry. The elegant wood handle provides both beauty and functionality. Ideal size for various cutting tasks.',
    isFeatured: false,
    imageFolder: 'YB17',
  },

  // ========== YB-18 Bush Craft Knife - Rosewood Handle ==========
  {
    sku: 'YB-18',
    name: 'Bush Craft Knife - Rosewood Handle',
    slug: 'bush-craft-knife-rosewood-handle-yb18',
    category: 'outdoor',
    handle: 'Rosewood',
    blade: '440 C Stainless Steel',
    lengthBlade: '100mm',
    lengthHandle: '110mm',
    packageWeight: 780, // grams
    casing: 'Cow Leather Sheath Black',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 80,
    stock: 13,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: '3.94 inches',
    description: 'Versatile bushcraft knife with elegant Rosewood handle. Features 440 C stainless steel blade with mirror polish for outdoor adventures. Perfect balance of size and functionality. The classic wood handle provides comfortable grip during extended use.',
    isFeatured: false,
    imageFolder: 'YB18',
  },

  // ========== YB-19 Loveless Knife - Mikarta Black Handle ==========
  {
    sku: 'YB-19',
    name: 'Loveless Style Knife - Mikarta Black Handle',
    slug: 'loveless-style-knife-mikarta-black-handle-yb19',
    category: 'tactical',
    handle: 'Mikarta Black',
    blade: '440 C Stainless Steel',
    lengthBlade: '82mm',
    lengthHandle: '100mm',
    packageWeight: 820, // grams
    casing: 'Cow Leather Sheath',
    quantity: 3,
    finishing: 'Mirror Polish',
    price: 85,
    stock: 11,
    brand: 'Gladius',
    material: '440 C Stainless Steel',
    bladeLength: '3.23 inches',
    description: 'Tactical Loveless knife with durable Mikarta Black handle. Premium 440 C stainless steel blade with mirror polish for tactical reliability. The Mikarta material provides excellent grip in all conditions. Perfect for military, law enforcement, and tactical enthusiasts.',
    isFeatured: false,
    imageFolder: 'YB19',
  },

  // ========== YB-20 Chopper Knife - Rosewood Handle ==========
  {
    sku: 'YB-20',
    name: 'Heavy Duty Chopper Knife - Rosewood Handle',
    slug: 'heavy-duty-chopper-knife-rosewood-handle-yb20',
    category: 'chef',
    handle: 'Rosewood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '200mm',
    lengthHandle: '120mm',
    packageWeight: 910, // grams
    casing: 'Wooden Casing Taraik',
    quantity: 3,
    finishing: 'Mirror Finish',
    price: 120,
    stock: 7,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '7.87 inches',
    description: 'Heavy-duty chopper knife with beautiful Rosewood handle. Premium 12 C 27 stainless steel blade with mirror finish. Comes with elegant wooden casing for storage and display. Perfect for heavy chopping tasks in professional and home kitchens. The substantial weight aids in cutting through tough ingredients.',
    isFeatured: true,
    imageFolder: 'YB20',
  },

  // ========== NEW COLLECTION ITEMS ==========

  // ========== YB-21 Chef Knife - Paddockwood/Rosewood Handle ==========
  {
    sku: 'YB-21',
    name: 'Chef Knife - Paddockwood & Rosewood Handle',
    slug: 'chef-knife-paddockwood-rosewood-handle-yb21',
    category: 'chef',
    handle: 'Paddockwood/Rosewood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '240mm',
    lengthHandle: '125mm',
    packageWeight: 950, // grams
    casing: 'Wooden Sheath',
    quantity: 5,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 10,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.45 inches',
    description: 'Stunning chef knife featuring a unique combination of Paddockwood and Rosewood handle. Premium 12 C 27 stainless steel blade with elegant hammered finish. The mixed wood handle offers both visual appeal and excellent ergonomics. Comes with beautiful wooden sheath.',
    isFeatured: true,
    imageFolder: 'YB21',
  },

  // ========== YB-22 Chopper Knife - Paddockwood Handle ==========
  {
    sku: 'YB-22',
    name: 'Chopper Knife - Paddockwood Handle',
    slug: 'chopper-knife-paddockwood-handle-yb22',
    category: 'chef',
    handle: 'Paddockwood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '200mm',
    lengthHandle: '120mm',
    packageWeight: 920, // grams
    casing: 'Wooden Casing',
    quantity: 4,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 8,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '7.87 inches',
    description: 'Professional chopper knife with premium Paddockwood handle. Heavy-duty 12 C 27 stainless steel blade with hammered finish for reduced friction. Perfect for heavy chopping tasks and meat preparation. The substantial weight and blade geometry make quick work of tough ingredients.',
    isFeatured: false,
    imageFolder: 'YB22',
  },

  // ========== YB-23 Chef Knife - Paddockwood/Rosewood Handle ==========
  {
    sku: 'YB-23',
    name: 'Chef Knife - Hammered Paddockwood Handle',
    slug: 'chef-knife-hammered-paddockwood-handle-yb23',
    category: 'chef',
    handle: 'Paddockwood/Rosewood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '245mm',
    lengthHandle: '125mm',
    packageWeight: 940, // grams
    casing: 'Wooden Sheath',
    quantity: 4,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 9,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.65 inches',
    description: 'Exceptional chef knife with mixed Paddockwood and Rosewood handle. Features premium stainless steel blade with distinctive hammered finish. The unique handle combination provides both aesthetics and functionality. Ideal for professional chefs and serious cooking enthusiasts.',
    isFeatured: false,
    imageFolder: 'YB23',
  },

  // ========== YB-25 Chef Knife - Paddockwood Handle ==========
  {
    sku: 'YB-25',
    name: 'Slicing Chef Knife - Paddockwood Handle',
    slug: 'slicing-chef-knife-paddockwood-handle-yb25',
    category: 'chef',
    handle: 'Paddockwood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '250mm',
    lengthHandle: '120mm',
    packageWeight: 900, // grams
    casing: 'Wooden Sheath',
    quantity: 5,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 12,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.84 inches',
    description: 'Professional slicing chef knife with elegant Paddockwood handle. Long 250mm blade perfect for precise slicing and carving. Hammered finish reduces food sticking. The narrow profile allows for thin, precise cuts. Essential tool for slicing meats, fish, and vegetables.',
    isFeatured: true,
    imageFolder: 'YB25',
  },

  // ========== YB-26 Chef Knife - Oakwood/Wengewood Handle ==========
  {
    sku: 'YB-26',
    name: 'Chef Knife - Oakwood & Wengewood Handle',
    slug: 'chef-knife-oakwood-wengewood-handle-yb26',
    category: 'chef',
    handle: 'Oakwood/Wengewood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '240mm',
    lengthHandle: '125mm',
    packageWeight: 930, // grams
    casing: 'Wooden Sheath',
    quantity: 4,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 10,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.45 inches',
    description: 'Unique chef knife featuring Oakwood and Wengewood combination handle. Premium stainless steel blade with hammered finish. The contrasting wood colors create a striking visual appeal. Excellent balance and cutting performance for all kitchen tasks.',
    isFeatured: false,
    imageFolder: 'YB26',
  },

  // ========== YB-27 Chef Knife - Paddockwood/Rosewood Handle ==========
  {
    sku: 'YB-27',
    name: 'Chef Knife - Premium Paddockwood Handle',
    slug: 'chef-knife-premium-paddockwood-handle-yb27',
    category: 'chef',
    handle: 'Paddockwood/Rosewood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '235mm',
    lengthHandle: '125mm',
    packageWeight: 920, // grams
    casing: 'Leather Sheath Black',
    quantity: 5,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 11,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.25 inches',
    description: 'Premium chef knife with beautiful mixed wood handle combining Paddockwood and Rosewood. High-quality stainless steel blade with hammered finish for superior performance. Perfect balance and weight distribution. Comes with premium black leather sheath for protection.',
    isFeatured: true,
    imageFolder: 'YB27',
  },

  // ========== YB-28 Chef Knife - Wengewood Handle ==========
  {
    sku: 'YB-28',
    name: 'Chef Knife - Wengewood Handle',
    slug: 'chef-knife-wengewood-handle-yb28',
    category: 'chef',
    handle: 'Wengewood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '245mm',
    lengthHandle: '120mm',
    packageWeight: 910, // grams
    casing: 'Wooden Sheath',
    quantity: 4,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 10,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.65 inches',
    description: 'Elegant chef knife with exotic Wengewood handle. Premium 12 C 27 stainless steel blade with hammered finish. The dense Wengewood provides durability and beautiful dark grain pattern. Excellent for professional and home kitchens. Perfect weight and balance.',
    isFeatured: false,
    imageFolder: 'YB28',
  },

  // ========== YB-29 Chef Knife - Paddockwood Handle ==========
  {
    sku: 'YB-29',
    name: 'Chef Knife - Classic Paddockwood Handle',
    slug: 'chef-knife-classic-paddockwood-handle-yb29',
    category: 'chef',
    handle: 'Paddockwood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '240mm',
    lengthHandle: '125mm',
    packageWeight: 925, // grams
    casing: 'Wooden Sheath',
    quantity: 5,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 13,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.45 inches',
    description: 'Classic chef knife with premium Paddockwood handle. High-carbon stainless steel blade with distinctive hammered finish. The 240mm blade length offers excellent versatility. Perfect for slicing, dicing, and chopping all ingredients with precision and ease.',
    isFeatured: false,
    imageFolder: 'YB29',
  },

  // ========== YB-30 Chef Knife - Rosewood Handle ==========
  {
    sku: 'YB-30',
    name: 'Chef Knife - Traditional Rosewood Handle',
    slug: 'chef-knife-traditional-rosewood-handle-yb30',
    category: 'chef',
    handle: 'Rosewood',
    blade: '12 C 27 Stainless Steel',
    lengthBlade: '245mm',
    lengthHandle: '120mm',
    packageWeight: 915, // grams
    casing: 'Wooden Sheath',
    quantity: 5,
    finishing: 'Hammered Finish',
    price: 120,
    stock: 14,
    brand: 'Gladius',
    material: '12 C 27 Stainless Steel',
    bladeLength: '9.65 inches',
    description: 'Traditional chef knife with beautiful Rosewood handle. Premium stainless steel blade with hammered finish for reduced food sticking. The classic Rosewood provides warmth and elegance. Ideal weight distribution for extended use without fatigue. Professional quality craftsmanship.',
    isFeatured: false,
    imageFolder: 'YB30',
  },
];

// Function to generate unique slug
function generateSlug(name, sku) {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Add SKU to ensure uniqueness
  return `${baseSlug}-${sku.toLowerCase()}`;
}

// Function to upload images to Cloudinary
async function uploadImagesToCloudinary(imageFolder, productName) {
  const images = [];
  const imageFolderPath = path.join(process.cwd(), 'images', imageFolder);
  
  try {
    if (!fs.existsSync(imageFolderPath)) {
      console.log(`⚠️  Folder not found: ${imageFolderPath}`);
      console.log(`   Note: Images for ${imageFolder} should be uploaded manually to Cloudinary`);
      return images;
    }

    const files = fs.readdirSync(imageFolderPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    console.log(`   Found ${imageFiles.length} images in ${imageFolder}`);

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
    console.log('═'.repeat(70));
    console.log('   GLADIUS KNIFE PRODUCTS SEEDER - COMPLETE CATALOG');
    console.log('═'.repeat(70));
    console.log('\n🚀 Starting database seeding...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gladius-mern';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Clear existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`✓ Cleared ${deleteResult.deletedCount} existing products\n`);

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
        
        // Generate SEO fields
        const metaTitle = `${product.name} - Buy Online | Gladius Knives Wazirabad`;
        const metaDescription = product.description.substring(0, 150) + '... Handcrafted in Wazirabad, Pakistan.';
        const imageAlt = `${product.name} - ${product.handle} Handle - Gladius Knives`;
        
        // Create product object
        const productToSave = {
          name: product.name,
          slug: product.slug,
          sku: product.sku,
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
          countInStock: product.stock,
          brand: product.brand,
          material: product.material,
          bladeLength: product.bladeLength,
          description: product.description,
          images: images.length > 0 ? images : ['/api/placeholder/400/300'],
          isFeatured: product.isFeatured,
          rating: 0,
          numReviews: 0,
          metaTitle,
          metaDescription,
          imageAlt,
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
      console.log('═'.repeat(70));
      console.log('                    SEEDING SUMMARY');
      console.log('═'.repeat(70));
      console.log(`Total products processed: ${productsData.length}`);
      console.log(`Successfully seeded: ${successCount}`);
      console.log(`Failed: ${failCount}`);
      console.log(`Featured products: ${insertedProducts.filter(p => p.isFeatured).length}`);
      
      console.log('\n📦 Products by category:');
      const categories = {
        'chef': 'Chef Knives',
        'outdoor': 'Outdoor Knives',
        'hunting': 'Hunting Knives',
        'tactical': 'Tactical Knives'
      };
      
      Object.entries(categories).forEach(([slug, name]) => {
        const count = insertedProducts.filter(p => p.category === slug).length;
        console.log(`  • ${name.padEnd(20)}: ${count} products`);
      });

      console.log('\n💰 Price range:');
      const prices = insertedProducts.map(p => p.price);
      console.log(`  • Min: $${Math.min(...prices)}`);
      console.log(`  • Max: $${Math.max(...prices)}`);
      console.log(`  • Average: $${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}`);
      
      console.log('\n📊 Stock information:');
      console.log(`  • Total stock available: ${insertedProducts.reduce((sum, p) => sum + p.countInStock, 0)} units`);
      console.log(`  • Average stock per product: ${(insertedProducts.reduce((sum, p) => sum + p.countInStock, 0) / insertedProducts.length).toFixed(1)} units`);
      
      console.log('\n⚖️  Package weight range:');
      const weights = insertedProducts.map(p => p.packageWeight);
      console.log(`  • Lightest: ${Math.min(...weights)}g`);
      console.log(`  • Heaviest: ${Math.max(...weights)}g`);
      console.log(`  • Average: ${(weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(0)}g`);
      
      console.log('═'.repeat(70));
    }

    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    console.log('\n🎉 Seeding completed successfully!\n');
    console.log('💡 Note: Make sure to:');
    console.log('   1. Run the category seeder: node scripts/seedCategories.js');
    console.log('   2. Run the product migration: node scripts/fixExistingProducts.js');
    console.log('   3. Upload product images to the corresponding folders\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

/*
 * ═══════════════════════════════════════════════════════════════
 *                    USAGE INSTRUCTIONS
 * ═══════════════════════════════════════════════════════════════
 * 
 * 1. SETUP ENVIRONMENT VARIABLES (.env file):
 *    MONGODB_URI=mongodb://localhost:27017/gladius-mern
 *    CLOUDINARY_CLOUD_NAME=diielhgnq
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 * 
 * 2. CATEGORY MAPPING:
 *    - chef → Chef Knives
 *    - outdoor → Outdoor Knives (Bush Craft)
 *    - hunting → Hunting Knives (Skinner, Fillet)
 *    - tactical → Tactical Knives (Loveless)
 * 
 * 3. INSTALL DEPENDENCIES:
 *    npm install mongoose dotenv cloudinary
 * 
 * 4. RUN THE SEEDER:
 *    node seed.js
 * 
 * 5. IMPORTANT NOTES:
 *    - All 30 products from both catalogs included
 *    - Unique slugs for each product (includes SKU)
 *    - Package weight in grams
 *    - Stock quantity from Excel
 *    - All measurements preserved from Excel
 *    - SEO fields auto-generated
 *    - Images uploaded to Cloudinary (if folders exist)
 * 
 * ═══════════════════════════════════════════════════════════════
 */