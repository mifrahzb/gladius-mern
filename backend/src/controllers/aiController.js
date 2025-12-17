import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import CategoryContent from '../models/CategoryContent.js';
import {
  generateProductDescription,
  generateKeywords,
  classifySearchIntent,
  generateImageAlt,
  generateMetaDescription,
  generateProductSchema,
  generateFAQSchema,
  generateBuyingGuide,
  generateCategoryDescription,
  generateComparisonArticle,
  generateSEORecommendations,
  calculateSEOScore
} from '../services/aiService.js';

/**
 * @desc    Generate complete AI content for a product (CORE FEATURE #7)
 * @route   POST /api/ai/generate/: productId
 * @access  Private/Admin
 */
export const generateAIContent = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).populate('category');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  try {
    const categoryName = product.category?. name || 'Knife';
    
    console.log(`🤖 Generating AI content for:  ${product.name}`);
    
    // FEATURE 1: Generate product description
    const aiDescription = await generateProductDescription({
      name: product.name,
      category: categoryName,
      brand: product.brand,
      price: product.price,
      specifications: product.specifications
    });
    
    // FEATURE 2: Generate keywords with search intent
    const aiKeywords = await generateKeywords(
      product.name,
      categoryName,
      aiDescription
    );
    
    // Classify keyword intent
    const keywordIntent = aiKeywords.map(keyword => ({
      keyword,
      intent:  classifySearchIntent(keyword)
    }));
    
    // FEATURE 3: Generate meta description
    const aiMetaDesc = await generateMetaDescription(
      product.name,
      aiDescription,
      categoryName,
      product.price
    );
    
    // FEATURE 3: Generate image ALT texts
    const imageAlts = [];
    if (product.images && product.images.length > 0) {
      for (let i = 0; i < Math.min(product.images.length, 5); i++) {
        const imageUrl = typeof product.images[i] === 'string' 
          ? product.images[i] 
          : product.images[i].url;
        
        const altText = await generateImageAlt(
          product.name,
          categoryName,
          i,
          i === 0 ? 'main product photo' : ''
        );
        
        imageAlts.push({
          imageUrl,
          altText,
          category: i === 0 ? 'primary' : 'additional'
        });
      }
    }
    
    // FEATURE 4: Generate Product Schema
    const productSchemaData = generateProductSchema(product, categoryName);
    
    // FEATURE 4: Generate FAQ Schema
    const faqData = await generateFAQSchema(product. name, categoryName);
    
    // Update product with AI-generated content (pending approval)
    product.aiGeneratedDescription = aiDescription;
    product.aiGeneratedMetaDescription = aiMetaDesc;
    product.aiSuggestedKeywords = aiKeywords;
    product.aiKeywordIntent = keywordIntent;
    product.aiApprovalStatus = 'pending';
    product.aiGeneratedAt = new Date();
    product.imageAlts = imageAlts;
    product.productSchema = productSchemaData;
    
    if (faqData) {
      product.faqSchema = faqData. schema;
      product.faqs = faqData.faqs;
    }
    
    await product.save();

    console.log(`✅ AI content generated for:  ${product.name}`);

    res.json({
      success: true,
      message: 'AI content generated successfully.  Awaiting approval.',
      data: {
        productId: product._id,
        productName: product.name,
        aiGeneratedDescription: aiDescription,
        aiGeneratedMetaDescription: aiMetaDesc,
        aiSuggestedKeywords: aiKeywords,
        keywordIntent: keywordIntent,
        imageAlts: imageAlts,
        faqs: faqData?. faqs || [],
        status: 'pending',
        generatedAt: product.aiGeneratedAt
      }
    });
    
  } catch (error) {
    console.error('❌ AI Generation Error:', error);
    res.status(500);
    throw new Error(`Failed to generate AI content: ${error. message}`);
  }
});

/**
 * @desc    Approve AI-generated content (makes it live)
 * @route   PUT /api/ai/approve/:productId
 * @access  Private/Admin
 */
export const approveAIContent = asyncHandler(async (req, res) => {
  const product = await Product.findById(req. params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (! product.aiGeneratedDescription) {
    res.status(400);
    throw new Error('No AI-generated content to approve');
  }

  // Apply AI-generated content to live fields
  product.description = product.aiGeneratedDescription;
  product.metaDescription = product.aiGeneratedMetaDescription;
  product.metaKeywords = product.aiSuggestedKeywords;
  
  // Set focus keyword (first transactional keyword)
  const transactionalKeyword = product.aiKeywordIntent?. find(
    ki => ki.intent === 'transactional'
  );
  if (transactionalKeyword) {
    product.focusKeyword = transactionalKeyword.keyword;
  }
  
  product.aiApprovalStatus = 'approved';

  await product.save();

  console.log(`✅ AI content approved for: ${product.name}`);

  res.json({
    success: true,
    message: 'AI content approved and published',
    product: {
      _id: product._id,
      name: product.name,
      description: product.description,
      metaDescription: product.metaDescription,
      metaKeywords: product. metaKeywords,
      focusKeyword: product.focusKeyword,
      status: 'approved'
    }
  });
});

/**
 * @desc    Reject AI-generated content
 * @route   PUT /api/ai/reject/:productId
 * @access  Private/Admin
 */
export const rejectAIContent = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.aiApprovalStatus = 'rejected';
  await product.save();

  console.log(`❌ AI content rejected for: ${product.name}`);

  res.json({
    success: true,
    message:  'AI content rejected',
    productId: product._id,
    productName: product.name
  });
});

/**
 * @desc    Get SEO analysis for product (FEATURE 6)
 * @route   GET /api/ai/analyze/:productId
 * @access  Private/Admin
 */
export const analyzeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  try {
    console.log(`📊 Analyzing SEO for: ${product.name}`);
    
    // Generate AI recommendations
    const recommendations = await generateSEORecommendations({
      name: product.name,
      description: product.description,
      metaDescription: product.metaDescription,
      metaKeywords:  product.metaKeywords,
      imageAlts: product.imageAlts,
      focusKeyword: product.focusKeyword
    });
    
    // Calculate SEO score
    const seoScore = calculateSEOScore(product);

    res.json({
      success: true,
      analysis: recommendations,
      seoScore,
      currentSEO: {
        hasMetaDescription: !!product.metaDescription,
        metaDescriptionLength: product.metaDescription?. length || 0,
        descriptionLength: product.description?.length || 0,
        keywordsCount: product.metaKeywords?. length || 0,
        hasImageAlts: product.imageAlts?.length > 0,
        imageAltsCount: product.imageAlts?.length || 0,
        hasFocusKeyword: !!product.focusKeyword,
        hasProductSchema: !!product.productSchema,
        hasFAQSchema: !!product.faqSchema
      }
    });
    
  } catch (error) {
    console.error('❌ SEO Analysis Error:', error);
    res.status(500);
    throw new Error('Failed to analyze product');
  }
});

/**
 * @desc    Batch generate AI content for multiple products
 * @route   POST /api/ai/batch-generate
 * @access  Private/Admin
 */
export const batchGenerateAI = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  if (!productIds || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs required');
  }

  if (productIds.length > 20) {
    res.status(400);
    throw new Error('Maximum 20 products per batch');
  }

  console.log(`🚀 Batch generating AI content for ${productIds.length} products`);

  const results = [];
  
  for (const productId of productIds) {
    try {
      const product = await Product.findById(productId).populate('category');
      
      if (!product) {
        results.push({ 
          productId, 
          success: false, 
          error: 'Product not found' 
        });
        continue;
      }

      const categoryName = product.category?.name || 'Knife';
      
      // Generate all AI content
      const [aiDescription, aiKeywords, aiMetaDesc] = await Promise.all([
        generateProductDescription({
          name:  product.name,
          category: categoryName,
          brand: product.brand,
          price: product.price,
          specifications: product.specifications
        }),
        generateKeywords(product.name, categoryName, product.description),
        generateMetaDescription(product.name, product. description, categoryName, product.price)
      ]);

      const keywordIntent = aiKeywords.map(keyword => ({
        keyword,
        intent: classifySearchIntent(keyword)
      }));

      product.aiGeneratedDescription = aiDescription;
      product.aiGeneratedMetaDescription = aiMetaDesc;
      product.aiSuggestedKeywords = aiKeywords;
      product.aiKeywordIntent = keywordIntent;
      product.aiApprovalStatus = 'pending';
      product. aiGeneratedAt = new Date();

      await product.save();
      
      results.push({ 
        productId, 
        success: true, 
        productName: product.name 
      });
      
      console.log(`✅ Generated AI content for: ${product.name}`);
      
    } catch (error) {
      results.push({ 
        productId, 
        success: false, 
        error:  error.message 
      });
      console.error(`❌ Failed for product ${productId}:`, error. message);
    }
  }

  const successCount = results.filter(r => r.success).length;

  res.json({
    success: true,
    message: `Processed ${productIds.length} products.  ${successCount} successful. `,
    results,
    summary: {
      total: productIds.length,
      successful: successCount,
      failed: productIds.length - successCount
    }
  });
});

/**
 * @desc    Generate category buying guide (FEATURE 5)
 * @route   POST /api/ai/category/: categoryId/buying-guide
 * @access  Private/Admin
 */
export const generateCategoryBuyingGuide = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  try {
    // Get sample products from this category
    const products = await Product.find({ category: category._id })
      .limit(10)
      .select('name price specifications');
    
    // Generate buying guide
    const buyingGuide = await generateBuyingGuide(category.name, products);
    
    // Generate category description
    const categoryDesc = await generateCategoryDescription(category.name, products. length);
    
    // Save to CategoryContent
    let categoryContent = await CategoryContent.findOne({ category: category._id });
    
    if (!categoryContent) {
      categoryContent = new CategoryContent({
        category: category._id,
        description: categoryDesc,
        buyingGuide: buyingGuide,
        aiGenerated: true
      });
    } else {
      categoryContent. description = categoryDesc;
      categoryContent.buyingGuide = buyingGuide;
      categoryContent.aiGenerated = true;
      categoryContent.lastUpdated = new Date();
    }
    
    await categoryContent.save();
    
    console.log(`✅ Generated buying guide for category: ${category.name}`);

    res.json({
      success: true,
      categoryName: category.name,
      description: categoryDesc,
      buyingGuide: buyingGuide,
      productCount: products.length
    });
    
  } catch (error) {
    console.error('❌ Buying Guide Error:', error);
    res.status(500);
    throw new Error('Failed to generate buying guide');
  }
});

/**
 * @desc    Generate product comparison article (FEATURE 5)
 * @route   POST /api/ai/compare
 * @access  Private/Admin
 */
export const generateProductComparison = asyncHandler(async (req, res) => {
  const { productId1, productId2 } = req.body;
  
  if (!productId1 || !productId2) {
    res.status(400);
    throw new Error('Two product IDs required');
  }

  try {
    const [product1, product2] = await Promise.all([
      Product. findById(productId1),
      Product.findById(productId2)
    ]);
    
    if (!product1 || !product2) {
      res.status(404);
      throw new Error('One or both products not found');
    }
    
    const comparisonArticle = await generateComparisonArticle(product1, product2);
    
    console.log(`✅ Generated comparison:  ${product1.name} vs ${product2.name}`);

    res.json({
      success: true,
      product1: product1.name,
      product2: product2.name,
      article: comparisonArticle
    });
    
  } catch (error) {
    console.error('❌ Comparison Error:', error);
    res.status(500);
    throw new Error('Failed to generate comparison');
  }
});

/**
 * @desc    Get all products with AI status (for admin dashboard)
 * @route   GET /api/ai/products/status
 * @access  Private/Admin
 */
export const getAIProductsStatus = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find()
      .select('name aiApprovalStatus aiGeneratedAt aiGeneratedDescription')
      .populate('category', 'name')
      .sort({ aiGeneratedAt: -1 });
    
    const summary = {
      total: products. length,
      pending: products.filter(p => p.aiApprovalStatus === 'pending').length,
      approved: products.filter(p => p.aiApprovalStatus === 'approved').length,
      rejected: products.filter(p => p.aiApprovalStatus === 'rejected').length,
      noAI: products.filter(p => !p.aiGeneratedDescription).length
    };

    res.json({
      success: true,
      summary,
      products
    });
    
  } catch (error) {
    console.error('❌ Get AI Status Error:', error);
    res.status(500);
    throw new Error('Failed to get AI status');
  }
});

/**
 * @desc    Regenerate AI content for a product
 * @route   PUT /api/ai/regenerate/: productId
 * @access  Private/Admin
 */
export const regenerateAIContent = asyncHandler(async (req, res) => {
  // Same as generateAIContent but overwrites existing
  const product = await Product.findById(req.params.productId).populate('category');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  try {
    const categoryName = product.category?. name || 'Knife';
    
    console.log(`🔄 Regenerating AI content for: ${product.name}`);
    
    const aiDescription = await generateProductDescription({
      name:  product.name,
      category: categoryName,
      brand: product.brand,
      price: product.price,
      specifications: product.specifications
    });
    
    const aiKeywords = await generateKeywords(product.name, categoryName, aiDescription);
    const keywordIntent = aiKeywords.map(keyword => ({
      keyword,
      intent: classifySearchIntent(keyword)
    }));
    
    const aiMetaDesc = await generateMetaDescription(
      product.name,
      aiDescription,
      categoryName,
      product.price
    );
    
    product.aiGeneratedDescription = aiDescription;
    product.aiGeneratedMetaDescription = aiMetaDesc;
    product.aiSuggestedKeywords = aiKeywords;
    product.aiKeywordIntent = keywordIntent;
    product.aiApprovalStatus = 'pending';
    product.aiGeneratedAt = new Date();

    await product.save();

    res.json({
      success: true,
      message: 'AI content regenerated successfully',
      data: {
        productId: product._id,
        productName: product.name,
        aiGeneratedDescription: aiDescription,
        aiGeneratedMetaDescription: aiMetaDesc,
        aiSuggestedKeywords: aiKeywords
      }
    });
    
  } catch (error) {
    console.error('❌ Regeneration Error:', error);
    res.status(500);
    throw new Error('Failed to regenerate AI content');
  }
});

export default {
  generateAIContent,
  approveAIContent,
  rejectAIContent,
  analyzeProduct,
  batchGenerateAI,
  generateCategoryBuyingGuide,
  generateProductComparison,
  getAIProductsStatus,
  regenerateAIContent
};