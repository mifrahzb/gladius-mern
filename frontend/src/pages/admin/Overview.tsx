import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  AlertTriangle 
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const Overview = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading stats',
        description: error.response?.data?.message || 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.overview.totalRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {stats.overview.totalOrders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.inventory.inStockCount} in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats.inventory.lowStockProducts.length > 0 && (
        <Card className="mb-8 border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-900">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 mb-4">
              {stats.inventory.lowStockProducts.length} product(s) are running low on stock
            </p>
            <div className="space-y-2">
              {stats.inventory.lowStockProducts.map((product: any) => (
                <div key={product._id} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-sm text-yellow-700">
                    Stock: {product.countInStock}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.orders.recent.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {stats.orders.recent.map((order: any) => (
                <div key={order._id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{order.user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${order.totalPrice?.toFixed(2)}</p>
                    <p className={`text-xs ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;