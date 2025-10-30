import slugify from 'slugify';

/**
 * Generate SEO-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - SEO-friendly slug
 */
export const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

/**
 * Generate meta description with optimal length (150-160 characters)
 * @param {string} description - Full description
 * @returns {string} - Truncated meta description
 */
export const generateMetaDescription = (description) => {
  if (!description) return '';
  const maxLength = 160;
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3).trim() + '...';
};

/**
 * Generate structured data (JSON-LD) for products
 * @param {Object} product - Product object
 * @returns {Object} - Structured data object
 */
export const generateProductStructuredData = (product) => {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map(img => typeof img === 'string' ? img : img.url) || [],
    "description": product.description,
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Gladius Traders"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.FRONTEND_URL}/product/${product.category?.slug || 'knives'}/${product.slug}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": product.countInStock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": product.rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.numReviews
    } : undefined
  };
};

/**
 * Generate breadcrumb structured data
 * @param {Array} items - Breadcrumb items [{name, url}, ...]
 * @returns {Object} - Breadcrumb structured data
 */
export const generateBreadcrumbStructuredData = (items) => {
  return {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

/**
 * Extract plain text from HTML content
 * @param {string} html - HTML content
 * @returns {string} - Plain text
 */
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

/**
 * Generate optimized meta title
 * @param {string} title - Base title
 * @param {string} siteName - Site name
 * @returns {string} - Optimized title (50-60 characters)
 */
export const generateMetaTitle = (title, siteName = 'Gladius Traders') => {
  const maxLength = 60;
  const fullTitle = `${title} | ${siteName}`;
  
  if (fullTitle.length <= maxLength) return fullTitle;
  
  // If too long, just use the title without site name
  if (title.length <= maxLength) return title;
  
  // Truncate if necessary
  return title.substring(0, maxLength - 3).trim() + '...';
};

/**
 * Generate image alt text
 * @param {string} productName - Product name
 * @param {string} category - Category name
 * @param {number} index - Image index
 * @returns {string} - Optimized alt text
 */
export const generateImageAlt = (productName, category, index = 0) => {
  if (index === 0) {
    return `${productName} - Handcrafted ${category || 'Knife'} from Wazirabad, Pakistan`;
  }
  return `${productName} ${category || 'Knife'} - View ${index + 1}`;
};

export default {
  generateSlug,
  generateMetaDescription,
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
  stripHtml,
  generateMetaTitle,
  generateImageAlt
};