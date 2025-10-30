import express from 'express';
import { generateSitemap, generateRobotsTxt } from '../utils/sitemapGenerator.js';

const router = express.Router();

// @desc    Generate and serve XML sitemap
// @route   GET /sitemap.xml
// @access  Public
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://gladiustraders.com';
    const sitemap = await generateSitemap(baseUrl);
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('❌ Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// @desc    Generate and serve robots.txt
// @route   GET /robots.txt
// @access  Public
router.get('/robots.txt', (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://gladiustraders.com';
    const robotsTxt = generateRobotsTxt(baseUrl);
    
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('❌ Robots.txt error:', error);
    res.status(500).send('Error generating robots.txt');
  }
});

export default router;