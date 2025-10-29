import React, { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersApi.getUserOrders();
      setOrders(response.data.orders || response.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load orders'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
        <Link to="/collections">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Order History</h2>
      </div>
      
      <div className="divide-y">
        {orders.map((order) => (
          <div key={order._id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold">Order #{order._id.slice(-8)}</p>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge>{order.status}</Badge>
            </div>

            <div className="space-y-3">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <p className="text-lg font-bold">
                Total: ${order.totalPrice?.toFixed(2)}
              </p>
              <Link to={`/account/orders/${order._id}`}>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};