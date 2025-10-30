import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue from all orders
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Get total products count
    const totalProducts = await Product.countDocuments();
    
    // Get total customers (users with role 'user')
    const totalCustomers = await User.countDocuments({ role: 'user' });
    
    // Get recent orders (last 10)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get low stock products (stock <= 5)
    const lowStockProducts = await Product.find({ countInStock: { $lte: 5, $gt: 0 } })
      .select('name countInStock')
      .limit(10);
    
    // Get out of stock products
    const outOfStockCount = await Product.countDocuments({ countInStock: 0 });
    
    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$isPaid',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get top selling products (by order frequency)
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.qty' },
          revenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' }
    ]);
    
    // Get revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      overview: {
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        totalProducts,
        totalCustomers
      },
      inventory: {
        lowStockProducts,
        outOfStockCount,
        inStockCount: totalProducts - outOfStockCount
      },
      orders: {
        recent: recentOrders,
        byStatus: ordersByStatus
      },
      topProducts,
      revenueByMonth
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer statistics with reviews
// @route   GET /api/admin/customers/stats
// @access  Private/Admin
export const getCustomerStats = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' }).select('name email createdAt');
    
    // Get order count and reviews for each customer
    const customersWithData = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ user: customer._id });
        const orders = await Order.find({ user: customer._id });
        const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        
        // Get customer reviews
        const reviews = await Review.find({ user: customer._id })
          .populate('product', 'name')
          .sort({ createdAt: -1 });
        
        return {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          joinDate: customer.createdAt,
          totalOrders: orderCount,
          totalSpent: totalSpent.toFixed(2),
          reviews: reviews
        };
      })
    );
    
    res.json({ customers: customersWithData });
  } catch (error) {
    console.error('❌ Customer stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews with customer info
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ reviews });
  } catch (error) {
    console.error('❌ Get all reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};