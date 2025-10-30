import Product from '../models/Product.js';
import Category from '../models/Category.js';

/**
 * Generate XML sitemap for SEO
 * @param {string} baseUrl - Base URL of the website
 * @returns {Promise<string>} - XML sitemap string
 */
export const generateSitemap = async (baseUrl = 'https://gladiustraders.com') => {
  try {
    // Get all products with categories
    const products = await Product.find({ countInStock: { $gt: 0 } })
      .populate('category', 'slug')
      .select('slug updatedAt category')
      .sort({ updatedAt: -1 });

    // Get all categories
    const categories = await Category.find({ isActive: true })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 });

    // Static pages
    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: '/about', changefreq: 'monthly', priority: '0.8' },
      { url: '/contact', changefreq: 'monthly', priority: '0.8' },
      { url: '/collections', changefreq: 'daily', priority: '0.9' },
    ];

    // Build sitemap XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += '  </url>\n';
    }

    // Add category pages
    for (const category of categories) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/knives/${category.slug}</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `    <lastmod>${category.updatedAt.toISOString()}</lastmod>\n`;
      xml += '  </url>\n';
    }

    // Add product pages
    for (const product of products) {
      const categorySlug = product.category?.slug || 'knives';
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/product/${categorySlug}/${product.slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `    <lastmod>${product.updatedAt.toISOString()}</lastmod>\n`;
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    return xml;
  } catch (error) {
    console.error('❌ Sitemap generation error:', error);
    throw error;
  }
};

/**
 * Generate robots.txt content
 * @param {string} baseUrl - Base URL of the website
 * @returns {string} - robots.txt content
 */
export const generateRobotsTxt = (baseUrl = 'https://gladiustraders.com') => {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /cart
Disallow: /checkout
Disallow: /account/

Sitemap: ${baseUrl}/sitemap.xml
`;
};

export default {
  generateSitemap,
  generateRobotsTxt
};