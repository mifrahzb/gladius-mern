import axios from 'axios';

const API_URL = import.meta. env.VITE_API_URL || 'http://localhost:5000';

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analyticsSessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analyticsSessionId', sessionId);
  }
  return sessionId;
};

// Get device type
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Track event
export const trackEvent = async (
  type: 'page_view' | 'product_view' | 'add_to_cart' | 'remove_from_cart' | 'checkout_start' | 'purchase' | 'click' | 'search',
  data?:  {
    productId?: string;
    page?: string;
    element?: string;
    searchQuery?: string;
    metadata?: any;
  }
) => {
  try {
    const sessionId = getSessionId();
    const userId = localStorage.getItem('userId') || undefined;
    
    // FIXED: Single /api prefix
    await axios.post(`${API_URL}/analytics/track`, {
      sessionId,
      type,
      productId: data?.productId,
      page: data?.page || window.location.pathname,
      element: data?.element,
      searchQuery: data?.searchQuery,
      userId,
      device: getDeviceType(),
      browser: navigator.userAgent,
      referrer: document.referrer
    });
  } catch (error) {
    // Silent fail for analytics - don't disrupt user experience
    console.error('Analytics tracking error:', error);
  }
};

// End session (call on page unload)
export const endSession = async () => {
  try {
    const sessionId = getSessionId();
    await axios.post(`${API_URL}/analytics/end-session`, { sessionId });
    sessionStorage.removeItem('analyticsSessionId');
  } catch (error) {
    console.error('End session error:', error);
  }
};

// Track product view
export const trackProductView = (productId: string) => {
  trackEvent('product_view', { productId });
};

// Track add to cart
export const trackAddToCart = (productId: string) => {
  trackEvent('add_to_cart', { productId });
};

// Track search
export const trackSearch = (searchQuery: string) => {
  trackEvent('search', { searchQuery });
};

// Track click
export const trackClick = (element: string) => {
  trackEvent('click', { element });
};

// Initialize analytics
export const initAnalytics = () => {
  // Track initial page view
  trackEvent('page_view', { page: window.location. pathname });
  
  // Track page views on route change
  let lastPath = window.location.pathname;
  const checkPathChange = () => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      trackEvent('page_view', { page: currentPath });
    }
  };
  
  const observer = new MutationObserver(checkPathChange);
  observer.observe(document.body, { childList: true, subtree: true });
  
  window.addEventListener('popstate', () => {
    trackEvent('page_view', { page: window.location.pathname });
  });
  
  window.addEventListener('beforeunload', () => {
    endSession();
  });
  
  return () => {
    observer.disconnect();
  };
};

export default {
  trackEvent,
  trackProductView,
  trackAddToCart,
  trackSearch,
  trackClick,
  endSession,
  initAnalytics
};