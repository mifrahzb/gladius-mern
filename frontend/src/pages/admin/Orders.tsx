import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Truck, Check } from 'lucide-react';

import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customer: string;
  email: string;
  products: number;
  total: number;
  status: string;
  date: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const savedOrders = localStorage.getItem('admin_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem('admin_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    toast({
      title: "Order updated",
      description: `Order ${orderId} status changed to ${newStatus}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, className: string }> = {
      'Processing': { variant: 'outline', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      'Shipped': { variant: 'outline', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      'Delivered': { variant: 'outline', className: 'bg-green-100 text-green-800 border-green-300' },
    };
    return variants[status] || variants.Processing;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">Manage and fulfill customer orders</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Order ID</th>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Products</th>
                  <th className="text-left p-4 font-semibold">Total</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No orders yet. Orders will appear here when customers make purchases.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                  const statusConfig = getStatusBadge(order.status);
                  return (
                    <tr key={order.id} className="border-b hover:bg-muted/30">
                      <td className="p-4 font-semibold">{order.id}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">{order.email}</p>
                        </div>
                      </td>
                      <td className="p-4">{order.products} items</td>
                      <td className="p-4 font-semibold">${order.total}</td>
                      <td className="p-4">
                        <Badge variant={statusConfig.variant} className={statusConfig.className}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{order.date}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {order.status === 'Processing' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'Shipped')}
                            >
                              <Truck className="w-3 h-3 mr-1" />
                              Ship
                            </Button>
                          )}
                          {order.status === 'Shipped' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'Delivered')}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Deliver
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
