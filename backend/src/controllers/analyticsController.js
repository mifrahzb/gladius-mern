import asyncHandler from 'express-async-handler';
import {
  trackEvent,
  endSession,
  getAnalytics,
  getProductAnalytics,
  getCartAbandonment
} from '../services/analyticsService.js';
import { analyzeBehaviorPattern } from '../services/aiService.js';

/**
 * @desc    Track an analytics event
 * @route   POST /api/analytics/track
 * @access  Public
 */
export const trackAnalyticsEvent = asyncHandler(async (req, res) => {
  const { sessionId, type, productId, page, element, searchQuery, userId, device, browser, referrer } = req.body;
  
  if (!sessionId || !type) {
    res.status(400);
    throw new Error('Session ID and event type required');
  }

  try {
    const session = await trackEvent(sessionId, {
      type,
      productId,
      page,
      element,
      searchQuery,
      userId,
      device,
      browser,
      referrer
    });

    res.json({
      success: true,
      message: 'Event tracked',
      sessionId: session?. sessionId
    });
    
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500);
    throw new Error('Failed to track event');
  }
});

/**
 * @desc    End an analytics session
 * @route   POST /api/analytics/end-session
 * @access  Public
 */
export const endAnalyticsSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    res.status(400);
    throw new Error('Session ID required');
  }

  try {
    const session = await endSession(sessionId);

    res.json({
      success: true,
      message: 'Session ended',
      duration: session?.duration
    });
    
  } catch (error) {
    console.error('End session error:', error);
    res.status(500);
    throw new Error('Failed to end session');
  }
});

/**
 * @desc    Get analytics dashboard data (FEATURE 6)
 * @route   GET /api/analytics/dashboard
 * @access  Private/Admin
 */
export const getAnalyticsDashboard = asyncHandler(async (req, res) => {
  const { days = 30 } = req. query;
  
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get all analytics data
    const sessions = await getAnalytics(startDate, endDate);
    
    // Get cart abandonment
    const abandonment = await getCartAbandonment(parseInt(days));
    
    // Analyze behavior patterns
    const behaviorAnalysis = analyzeBehaviorPattern({
      sessions:  sessions. map(s => ({
        duration: s.duration,
        timestamp: s.sessionStart
      })),
      productViews: sessions.flatMap(s => 
        s.events.filter(e => e.type === 'product_view').map(e => ({ productId: e.productId }))
      ),
      clickPatterns: sessions.flatMap(s => 
        s.events. filter(e => e.type === 'click').map(e => ({ element: e.element }))
      ),
      cartAbandonment: sessions.filter(s => {
        const hasAddToCart = s.events.some(e => e.type === 'add_to_cart');
        const hasPurchase = s.events.some(e => e.type === 'purchase');
        return hasAddToCart && ! hasPurchase;
      })
    });
    
    res.json({
      success: true,
      period: { days: parseInt(days), startDate, endDate },
      totalSessions: sessions.length,
      cartAbandonment:  abandonment,
      behaviorAnalysis,
      topProducts: behaviorAnalysis.mostViewedProducts,
      recommendations: behaviorAnalysis.recommendations
    });
    
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500);
    throw new Error('Failed to get analytics dashboard');
  }
});

/**
 * @desc    Get product-specific analytics
 * @route   GET /api/analytics/product/:productId
 * @access  Private/Admin
 */
export const getProductAnalyticsData = asyncHandler(async (req, res) => {
  const { days = 30 } = req. query;
  
  try {
    const analytics = await getProductAnalytics(req.params.productId, parseInt(days));
    
    if (!analytics) {
      res.status(404);
      throw new Error('No analytics found for this product');
    }

    res.json({
      success: true,
      productId: req.params.productId,
      period: `${days} days`,
      analytics
    });
    
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500);
    throw new Error('Failed to get product analytics');
  }
});

export default {
  trackAnalyticsEvent,
  endAnalyticsSession,
  getAnalyticsDashboard,
  getProductAnalyticsData
};