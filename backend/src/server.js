import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; // NEW
import analyticsRoutes from './routes/analyticsRoutes.js'; // NEW
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express. json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors({
  origin: process.env. FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/', (req, res) => res.json({ 
  message: 'Gladius API Running',
  version: '2.0.0',
  features: ['AI-Powered SEO', 'Analytics', 'Smart Content Generation']
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/ai', aiRoutes); // NEW:  AI content generation
app.use('/api/analytics', analyticsRoutes); // NEW: Analytics tracking

// Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env. PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 GLADIUS API SERVER                          ║
║                                                   ║
║   Port: ${PORT}                                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
║   AI-Powered SEO: ✓ ACTIVE                       ║
║   Analytics: ✓ ACTIVE                            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

export default app;