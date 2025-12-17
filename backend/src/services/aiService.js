import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Add right after imports in aiService.js:
console.log('=== GEMINI API KEY DEBUG ===');
console.log('Key exists:', !!process.env.GEMINI_API_KEY);
console.log('Key length:', process.env.GEMINI_API_KEY?.length);
console.log('Key preview:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
console.log('=== END DEBUG ===');

// Test the key immediately
try {
  const testGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const testModel = testGenAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  console.log('✅ Gemini API initialized successfully');
} catch (error) {
  console.error('❌ Gemini API initialization failed:', error.message);
}

/**
 * FEATURE 1: AI-DRIVEN PRODUCT CONTENT OPTIMIZATION
 * Generates unique, keyword-rich product descriptions
 */
export const generateProductDescription = async (productData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const prompt = `You are an expert e-commerce copywriter specializing in knife products. Create a compelling, SEO-optimized product description. 

Product Details:
- Name: ${productData.name}
- Category: ${productData.category || 'Knife'}
- Brand: ${productData.brand || 'Gladius'}
- Price: $${productData.price}
- Specifications: ${JSON.stringify(productData.specifications || {}, null, 2)}

Requirements:
1. Write 3 paragraphs (180-220 words total)
2. First paragraph: Hook + key benefit + primary use case
3. Second paragraph: Technical features, materials, craftsmanship
4. Third paragraph: Benefits, durability, value proposition
5. Use natural keyword placement (knife, blade, ${productData.category}, ${productData.brand})
6. Write in professional, engaging tone
7. Focus on quality, functionality, and value
8. Include sensory details (feel, balance, precision)
9. NO marketing fluff or exaggeration
10. Make it unique and specific to this product

Return ONLY the description text, no headings or formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log(`✅ Generated description for ${productData.name} (${text.length} chars)`);
    return text;
    
  } catch (error) {
    console.error('❌ AI Description Error:', error.message);
    throw new Error(`AI generation failed: ${error.message}`);
  }
};

/**
 * FEATURE 2: AI KEYWORD RESEARCH & SEARCH INTENT
 * Analyzes and generates relevant SEO keywords
 */
export const generateKeywords = async (productName, category, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const prompt = `You are an SEO keyword research expert for e-commerce. Analyze this product and generate optimal keywords.

Product: ${productName}
Category: ${category}
Description: ${description?.substring(0, 200)}

Generate 8-10 keywords with search intent classification: 

Requirements:
1. Include 2-3 short-tail keywords (1-2 words, high volume, transactional)
2. Include 4-5 long-tail keywords (3-5 words, specific, high intent)
3. Include 2 question-based keywords (informational intent)
4. Consider buyer journey:  discovery → research → purchase
5. Mix branded and non-branded terms
6. Include material, style, and use-case keywords

Format: Return ONLY comma-separated keywords, no explanations. 
Example: professional chef knife, damascus steel blade, kitchen knife set for home cooks, best chef knife under 100, what knife do professional chefs use

Generate keywords: `;

    const result = await model. generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse keywords
    const keywords = text
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0 && k.length < 60)
      .slice(0, 10);
    
    console.log(`✅ Generated ${keywords.length} keywords for ${productName}`);
    return keywords;
    
  } catch (error) {
    console.error('❌ AI Keywords Error:', error.message);
    // Fallback keywords
    return [
      productName.toLowerCase(),
      `${category} knife`.toLowerCase(),
      'premium knife',
      'professional cutlery',
      'handcrafted blade'
    ];
  }
};

/**
 * FEATURE 2 (continued): Classify Search Intent
 */
export const classifySearchIntent = (keyword) => {
  const informational = ['what', 'how', 'why', 'guide', 'tutorial', 'learn', 'tips'];
  const navigational = ['brand', 'official', 'website', 'store'];
  const transactional = ['buy', 'price', 'cheap', 'best', 'review', 'discount', 'shop', 'purchase'];
  
  const lowerKeyword = keyword.toLowerCase();
  
  if (informational.some(word => lowerKeyword.includes(word))) {
    return 'informational';
  } else if (navigational.some(word => lowerKeyword.includes(word))) {
    return 'navigational';
  } else if (transactional.some(word => lowerKeyword.includes(word))) {
    return 'transactional';
  }
  
  return 'transactional'; // Default for product pages
};

/**
 * FEATURE 3: AI FOR IMAGE SEO
 * Generates descriptive ALT text for product images
 */
export const generateImageAlt = async (productName, category, imageIndex = 0, imageContext = '') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const viewTypes = [
      'product showcase',
      'side profile view',
      'detailed close-up',
      'handle grip detail',
      'full blade view',
      'packaging view'
    ];
    
    const prompt = `Generate descriptive ALT text for a product image (for SEO and accessibility).

Product: ${productName}
Category: ${category}
Image Type: ${viewTypes[imageIndex] || `view ${imageIndex + 1}`}
Context: ${imageContext || 'product photography'}

Requirements:
1. 80-125 characters (optimal for SEO)
2. Describe what's visible in the image
3. Include product name
4. Include key visual features (material, finish, style)
5. Natural language (not keyword stuffing)
6. Helpful for visually impaired users
7. SEO-friendly without being spammy

Format: Return ONLY the ALT text, no quotes or extra text. 
Example: Damascus steel chef knife with rosewood handle showing intricate blade pattern

Generate ALT text:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response. text().trim().replace(/^["']|["']$/g, '');
    
    // Ensure length is optimal
    const optimizedAlt = text.length > 125 ? text.substring(0, 122) + '...' : text;
    
    console.log(`✅ Generated ALT text for ${productName} image ${imageIndex + 1}`);
    return optimizedAlt;
    
  } catch (error) {
    console.error('❌ AI Image ALT Error:', error.message);
    // Fallback ALT text
    return `${productName} - ${category} - Image ${imageIndex + 1}`;
  }
};

/**
 * FEATURE 3 (continued): Detect Duplicate Images (placeholder for future ML model)
 */
export const detectDuplicateImages = async (imageUrls) => {
  // This would integrate with an image comparison service or ML model
  // For now, return a simple hash-based comparison
  const duplicates = [];
  const seen = new Map();
  
  imageUrls.forEach((url, index) => {
    const hash = url.split('/').pop(); // Simple hash using filename
    if (seen.has(hash)) {
      duplicates. push({ original: seen.get(hash), duplicate: index });
    } else {
      seen.set(hash, index);
    }
  });
  
  return duplicates;
};

/**
 * FEATURE 3 (continued): Categorize Images
 */
export const categorizeImage = (imageUrl, productName) => {
  const url = imageUrl.toLowerCase();
  
  if (url.includes('main') || url.includes('primary')) return 'primary';
  if (url.includes('detail') || url.includes('close')) return 'detail';
  if (url.includes('lifestyle') || url.includes('use')) return 'lifestyle';
  if (url.includes('packaging') || url.includes('box')) return 'packaging';
  if (url.includes('back') || url.includes('rear')) return 'back-view';
  
  return 'additional';
};

/**
 * FEATURE 3 (continued): Generate SEO Meta Description
 */
export const generateMetaDescription = async (productName, description, category, price) => {
  try {
    const model = genAI. getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const prompt = `Create an SEO-optimized meta description for a product page.

Product: ${productName}
Category: ${category}
Price: $${price}
Description: ${description?. substring(0, 150)}

Requirements:
1. Exactly 150-155 characters (strict limit for Google)
2. Include primary keyword naturally
3. Include price if competitive
4. Include compelling benefit or unique feature
5. Include subtle call-to-action
6. Make it click-worthy
7. NO clickbait or false promises

Format: Return ONLY the meta description, no quotes.
Example: Premium Damascus chef knife with rosewood handle.  8-inch blade, professional quality.  $129.  Free shipping on orders over $50.

Generate meta description:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim().replace(/^["']|["']$/g, '');
    
    // Ensure strict character limit
    if (text.length > 155) {
      text = text.substring(0, 152) + '...';
    }
    
    console.log(`✅ Generated meta description for ${productName} (${text.length} chars)`);
    return text;
    
  } catch (error) {
    console.error('❌ AI Meta Description Error:', error. message);
    // Fallback
    const fallback = `${productName} - Premium ${category}.  $${price}. Shop now for quality craftsmanship.`;
    return fallback. substring(0, 155);
  }
};

/**
 * FEATURE 4: AI FOR TECHNICAL SEO - Generate Product Schema
 */
export const generateProductSchema = (product, categoryName) => {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": Array.isArray(product.images) 
      ? product.images.map(img => typeof img === 'string' ? img : img.url)
      : [product.image],
    "description": product. description,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Gladius"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.FRONTEND_URL || 'https://gladiustraders.com'}/product/${product.slug}`,
      "priceCurrency": "USD",
      "price": product. price,
      "availability": product.countInStock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": product.rating && product.numReviews > 0 ?  {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.numReviews
    } : undefined,
    "category": categoryName
  };
  
  // Add specifications if available
  if (product. specifications) {
    schema.additionalProperty = Object.entries(product.specifications)
      .filter(([key, value]) => value)
      .map(([key, value]) => ({
        "@type": "PropertyValue",
        "name": key. replace(/([A-Z])/g, ' $1').trim(),
        "value": value
      }));
  }
  
  return schema;
};

/**
 * FEATURE 4 (continued): Generate FAQ Schema
 */
export const generateFAQSchema = async (productName, category) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const prompt = `Generate 5 common FAQs with answers for this product page (for FAQ Schema / SEO).

Product: ${productName}
Category: ${category}

Requirements:
1. Questions customers actually ask before buying
2. Include questions about:  specifications, care, shipping, warranty, usage
3. Answers should be concise (50-100 words)
4. Natural language, helpful tone
5. Include keywords naturally

Format as JSON array: 
[
  {"question": ".. .", "answer": "..."},
  {"question": "...", "answer": "..."}
]

Generate FAQs:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const faqs = JSON.parse(jsonMatch[0]);
      
      // Generate FAQ Schema
      const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity":  faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type":  "Answer",
            "text":  faq.answer
          }
        }))
      };
      
      console.log(`✅ Generated FAQ schema with ${faqs.length} questions`);
      return { faqs, schema };
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ AI FAQ Error:', error.message);
    return null;
  }
};

/**
 * FEATURE 5: AI CONTENT GENERATION FOR BLOGS & CATEGORIES
 * Generate category buying guide
 */
export const generateBuyingGuide = async (categoryName, products = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const productExamples = products.slice(0, 3).map(p => `- ${p.name} ($${p.price})`).join('\n');
    
    const prompt = `You are an expert content writer for an e-commerce knife store. Create a comprehensive buying guide for the ${categoryName} category.

Category: ${categoryName}
Available Products Examples:
${productExamples || 'Various professional knives'}

Structure (500-700 words):

1. Introduction (100 words)
   - Why this category matters
   - Who should buy these knives
   - Key benefits

2. What to Look For (200 words)
   - Blade material and construction
   - Handle ergonomics and materials
   - Balance and weight
   - Edge retention and sharpening
   - Intended use cases

3. Key Features to Consider (150 words)
   - Blade length and shape
   - Full tang vs partial tang
   - Maintenance requirements
   - Price vs quality considerations

4. Care and Maintenance (100 words)
   - Proper cleaning
   - Storage recommendations
   - Sharpening frequency
   - What to avoid

5. Making Your Decision (50 words)
   - Final tips
   - Quality indicators
   - Value for money

Requirements:
- SEO-optimized (include "${categoryName}" and related keywords naturally)
- Helpful, authoritative tone
- Practical, actionable advice
- No product promotions
- Build topical authority

Write the buying guide:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log(`✅ Generated buying guide for ${categoryName} (${text.length} chars)`);
    return text;
    
  } catch (error) {
    console.error('❌ AI Buying Guide Error:', error.message);
    return null;
  }
};

/**
 * FEATURE 5 (continued): Generate Category Description
 */
export const generateCategoryDescription = async (categoryName, productCount) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const prompt = `Create an SEO-optimized category description for an e-commerce knife store.

Category: ${categoryName}
Number of Products: ${productCount}

Requirements:
1. 150-200 words
2. First sentence: Clear definition of category
3. Include use cases and benefits
4. Mention variety and quality
5. Include "${categoryName}" keyword 2-3 times naturally
6. Professional, engaging tone
7. End with subtle CTA

Write the category description:`;

    const result = await model.generateContent(prompt);
    const response = await result. response;
    const text = response.text().trim();
    
    console.log(`✅ Generated category description for ${categoryName}`);
    return text;
    
  } catch (error) {
    console.error('❌ AI Category Description Error:', error. message);
    return `Explore our collection of ${categoryName. toLowerCase()}s.  Each piece is crafted for precision and durability.`;
  }
};

/**
 * FEATURE 5 (continued): Generate Comparison Article
 */
export const generateComparisonArticle = async (product1, product2) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const prompt = `Create a detailed product comparison article for SEO and customer decision-making.

Product 1: ${product1.name}
Price: $${product1.price}
Key Features: ${JSON.stringify(product1.specifications || {})}

Product 2: ${product2.name}
Price: $${product2.price}
Key Features: ${JSON.stringify(product2.specifications || {})}

Structure (400-500 words):
1. Introduction (50 words) - Why compare these two
2. Feature Comparison (200 words) - Side by side analysis
3. Performance & Quality (100 words) - Real-world usage
4. Value for Money (50 words) - Price vs features
5. Verdict (50 words) - Best for different users

Requirements:
- Objective, balanced comparison
- Highlight differences and similarities
- Help customers make informed choice
- SEO-optimized
- Include "vs" and "comparison" keywords

Write the comparison: `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log(`✅ Generated comparison article`);
    return text;
    
  } catch (error) {
    console.error('❌ AI Comparison Error:', error.message);
    return null;
  }
};

/**
 * FEATURE 6: AI ANALYTICS & BEHAVIOR PREDICTION
 * Analyze user behavior patterns
 */
export const analyzeBehaviorPattern = (analyticsData) => {
  const {
    sessions = [],
    clickPatterns = [],
    productViews = [],
    cartAbandonment = []
  } = analyticsData;
  
  const analysis = {
    totalSessions: sessions.length,
    avgSessionDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length || 0,
    mostViewedProducts: getMostFrequent(productViews),
    clickHotspots: getMostFrequent(clickPatterns),
    abandonmentRate: (cartAbandonment.length / sessions.length * 100) || 0,
    peakHours: getPeakHours(sessions),
    recommendations: []
  };
  
  // Generate recommendations
  if (analysis.abandonmentRate > 50) {
    analysis.recommendations. push('High cart abandonment - consider offering free shipping or discounts');
  }
  
  if (analysis.avgSessionDuration < 60) {
    analysis.recommendations. push('Low engagement - improve product descriptions and images');
  }
  
  if (analysis.mostViewedProducts.length > 0) {
    analysis.recommendations. push(`Feature "${analysis.mostViewedProducts[0].name}" more prominently`);
  }
  
  return analysis;
};

/**
 * Helper:  Get most frequent items
 */
function getMostFrequent(array) {
  const frequency = {};
  array.forEach(item => {
    const key = item.productId || item.element || item;
    frequency[key] = (frequency[key] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({ name: key, views: count }));
}

/**
 * Helper: Get peak hours
 */
function getPeakHours(sessions) {
  const hourCounts = new Array(24).fill(0);
  sessions.forEach(session => {
    if (session.timestamp) {
      const hour = new Date(session.timestamp).getHours();
      hourCounts[hour]++;
    }
  });
  
  const maxCount = Math.max(...hourCounts);
  return hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter(h => h.count === maxCount)
    .map(h => h.hour);
}

/**
 * FEATURE 6 (continued): Generate SEO Recommendations
 */
export const generateSEORecommendations = async (productData) => {
  try {
    const model = genAI. getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const prompt = `Analyze this product's SEO and provide specific, actionable recommendations.

Product: ${productData.name}
Description Length: ${productData.description?.length || 0} characters
Meta Description: ${productData.metaDescription || 'None'}
Meta Description Length: ${productData.metaDescription?.length || 0} characters
Keywords Count: ${productData.metaKeywords?.length || 0}
Keywords: ${productData. metaKeywords?. join(', ') || 'None'}
Image ALT Texts: ${productData.imageAlts?.length || 0}
Focus Keyword: ${productData.focusKeyword || 'None'}

Provide 5-7 specific, prioritized recommendations to improve SEO.  Each recommendation should: 
1. Identify the issue
2. Explain why it matters for SEO
3. Provide specific action to take

Format as numbered list.  Be concise (max 50 words per recommendation).

Generate recommendations:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response. text().trim();
    
    console.log(`✅ Generated SEO recommendations`);
    return text;
    
  } catch (error) {
    console.error('❌ AI SEO Recommendations Error:', error.message);
    return 'Unable to generate recommendations at this time. ';
  }
};

/**
 * Calculate SEO Score
 */
export const calculateSEOScore = (product) => {
  let score = 0;
  const checks = [];
  
  // Description length (0-25 points)
  const descLength = product.description?.length || 0;
  if (descLength >= 180 && descLength <= 400) {
    score += 25;
    checks.push({ name: 'Description Length', status: 'excellent', points: 25 });
  } else if (descLength >= 100) {
    score += 15;
    checks.push({ name: 'Description Length', status:  'good', points: 15 });
  } else {
    checks.push({ name: 'Description Length', status: 'poor', points: 0 });
  }
  
  // Meta description (0-20 points)
  const metaDescLength = product.metaDescription?. length || 0;
  if (metaDescLength >= 140 && metaDescLength <= 155) {
    score += 20;
    checks.push({ name: 'Meta Description', status:  'excellent', points: 20 });
  } else if (metaDescLength > 0) {
    score += 10;
    checks. push({ name: 'Meta Description', status: 'good', points: 10 });
  } else {
    checks.push({ name: 'Meta Description', status: 'poor', points: 0 });
  }
  
  // Keywords (0-20 points)
  const keywordCount = product.metaKeywords?.length || 0;
  if (keywordCount >= 5 && keywordCount <= 10) {
    score += 20;
    checks.push({ name: 'Keywords', status: 'excellent', points: 20 });
  } else if (keywordCount > 0) {
    score += 10;
    checks.push({ name: 'Keywords', status: 'good', points: 10 });
  } else {
    checks.push({ name: 'Keywords', status: 'poor', points: 0 });
  }
  
  // Image ALT texts (0-15 points)
  const altCount = product.imageAlts?. length || 0;
  const imageCount = product.images?.length || 1;
  if (altCount >= imageCount && altCount > 0) {
    score += 15;
    checks.push({ name: 'Image ALT Texts', status: 'excellent', points: 15 });
  } else if (altCount > 0) {
    score += 7;
    checks.push({ name: 'Image ALT Texts', status: 'good', points: 7 });
  } else {
    checks.push({ name: 'Image ALT Texts', status: 'poor', points: 0 });
  }
  
  // Focus keyword (0-10 points)
  if (product.focusKeyword) {
    score += 10;
    checks. push({ name: 'Focus Keyword', status: 'excellent', points: 10 });
  } else {
    checks.push({ name: 'Focus Keyword', status: 'poor', points: 0 });
  }
  
  // Slug quality (0-10 points)
  if (product.slug && product.slug.length > 3 && product.slug.includes('-')) {
    score += 10;
    checks.push({ name: 'SEO-Friendly URL', status: 'excellent', points: 10 });
  } else {
    checks.push({ name: 'SEO-Friendly URL', status: 'poor', points: 0 });
  }
  
  return {
    totalScore: score,
    maxScore: 100,
    percentage: score,
    grade: score >= 90 ? 'A+' : score >= 80 ?  'A' : score >= 70 ? 'B' :  score >= 60 ? 'C' : 'D',
    checks
  };
};

export default {
  generateProductDescription,
  generateKeywords,
  classifySearchIntent,
  generateImageAlt,
  detectDuplicateImages,
  categorizeImage,
  generateMetaDescription,
  generateProductSchema,
  generateFAQSchema,
  generateBuyingGuide,
  generateCategoryDescription,
  generateComparisonArticle,
  analyzeBehaviorPattern,
  generateSEORecommendations,
  calculateSEOScore
};