import React, { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll();
      setOrders(response.data.orders || response.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to load orders',
        description: error.response?.data?.message || 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast({
        title: 'Order updated successfully',
        description: `Status changed to ${newStatus}`
      });
      fetchOrders(); // refresh updated list
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update order',
        description: error.response?.data?.message || 'Please try again'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
        <p className="text-muted-foreground">View, update, and manage all customer orders</p>
      </div>

      <div className="overflow-x-auto bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Update Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono text-sm">{order._id.slice(-8)}</TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">{order.user?.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                    </div>
                  </TableCell>

                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>${order.totalPrice?.toFixed(2)}</TableCell>

                  <TableCell>
                    <Badge className={order.isPaid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge className={STATUS_COLORS[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order._id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Orders;