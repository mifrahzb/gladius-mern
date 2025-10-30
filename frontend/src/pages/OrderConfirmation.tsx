import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await ordersApi.getById(orderId!);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-green-500">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl mb-2">Order Confirmed!</CardTitle>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been received.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Order Number */}
              <div className="bg-muted/30 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="text-2xl font-bold font-mono">#{order._id.slice(-8)}</p>
              </div>

              {/* Order Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold">What's Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Processing</p>
                      <p className="text-sm text-muted-foreground">
                        We're preparing your order
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Shipped</p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive tracking info soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Order Details</h3>
                <div className="space-y-2">
                  {order.orderItems.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.name} x {item.qty}
                      </span>
                      <span className="font-semibold">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${order.itemsPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${order.taxPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${order.shippingPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-brown">${order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="bg-muted/30 p-3 rounded-lg text-sm">
                  <p>{order.shippingAddress?.address}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={() => navigate('/')} className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/profile/orders/${order._id}`)}
                  className="flex-1"
                >
                  View Order Details
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                A confirmation email has been sent to your email address.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;