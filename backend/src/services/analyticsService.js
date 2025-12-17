import mongoose from 'mongoose';

/**
 * FEATURE 6: Analytics Schema for tracking user behavior
 */
const analyticsSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose. Schema.Types.ObjectId,
    ref: 'User'
  },
  events: [{
    type: {
      type: String,
      enum: ['page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'purchase', 'click', 'search'],
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    page: String,
    element: String,
    searchQuery: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  sessionStart: {
    type: Date,
    default: Date.now
  },
  sessionEnd: Date,
  duration: Number, // in seconds
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet']
  },
  browser: String,
  referrer: String,
  ipAddress: String
}, {
  timestamps: true
});

// Index for queries
analyticsSchema.index({ sessionStart: -1 });
analyticsSchema.index({ 'events.productId': 1 });
analyticsSchema.index({ 'events.type': 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

/**
 * Track an event
 */
export const trackEvent = async (sessionId, eventData) => {
  try {
    let session = await Analytics.findOne({ sessionId, sessionEnd: null });
    
    if (!session) {
      session = new Analytics({
        sessionId,
        userId: eventData.userId,
        device: eventData.device || 'desktop',
        browser:  eventData.browser,
        referrer: eventData. referrer
      });
    }
    
    session.events.push({
      type: eventData.type,
      productId: eventData.productId,
      page: eventData. page,
      element: eventData.element,
      searchQuery: eventData.searchQuery,
      metadata: eventData.metadata
    });
    
    await session.save();
    return session;
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return null;
  }
};

/**
 * End a session
 */
export const endSession = async (sessionId) => {
  try {
    const session = await Analytics.findOne({ sessionId, sessionEnd: null });
    
    if (session) {
      session.sessionEnd = new Date();
      session.duration = Math.floor((session.sessionEnd - session.sessionStart) / 1000);
      await session.save();
    }
    
    return session;
    
  } catch (error) {
    console.error('End session error:', error);
    return null;
  }
};

/**
 * Get analytics for a time period
 */
export const getAnalytics = async (startDate, endDate) => {
  try {
    const sessions = await Analytics.find({
      sessionStart: {
        $gte:  startDate,
        $lte: endDate
      }
    }).populate('events.productId', 'name price category');
    
    return sessions;
    
  } catch (error) {
    console.error('Get analytics error:', error);
    return [];
  }
};

/**
 * Get product analytics
 */
export const getProductAnalytics = async (productId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  try {
    const analytics = await Analytics.aggregate([
      {
        $match: {
          sessionStart: { $gte: startDate },
          'events.productId': new mongoose.Types.ObjectId(productId)
        }
      },
      {
        $unwind: '$events'
      },
      {
        $match:  {
          'events.productId': new mongoose.Types.ObjectId(productId)
        }
      },
      {
        $group: {
          _id: '$events.type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      views: 0,
      addToCart: 0,
      purchases: 0
    };
    
    analytics. forEach(item => {
      if (item._id === 'product_view') result.views = item.count;
      if (item._id === 'add_to_cart') result.addToCart = item.count;
      if (item._id === 'purchase') result.purchases = item.count;
    });
    
    result.conversionRate = result.views > 0 ? (result. purchases / result.views * 100).toFixed(2) : 0;
    
    return result;
    
  } catch (error) {
    console.error('Product analytics error:', error);
    return null;
  }
};

/**
 * Get cart abandonment data
 */
export const getCartAbandonment = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  try {
    const sessions = await Analytics.find({
      sessionStart: { $gte: startDate },
      'events.type': 'add_to_cart'
    });
    
    const abandoned = sessions.filter(session => {
      const hasPurchase = session.events.some(e => e.type === 'purchase');
      return !hasPurchase;
    });
    
    return {
      total: sessions.length,
      abandoned: abandoned.length,
      rate: sessions.length > 0 ? (abandoned.length / sessions.length * 100).toFixed(2) : 0
    };
    
  } catch (error) {
    console.error('Cart abandonment error:', error);
    return null;
  }
};

export default {
  Analytics,
  trackEvent,
  endSession,
  getAnalytics,
  getProductAnalytics,
  getCartAbandonment
};