import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ordersApi } from '@/lib/api';
import { CreditCard, Truck, CheckCircle, Lock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const {
    items,
    shippingAddress,
    setShippingAddress,
    paymentMethod,
    setPaymentMethod,
    subtotal,
    tax,
    shippingCost,
    totalPrice,
    clearCart,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<'shipping' | 'payment' | 'review'>('shipping');

  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    fullName: shippingAddress?.fullName || user?.name || '',
    address: shippingAddress?.address || '',
    city: shippingAddress?.city || '',
    postalCode: shippingAddress?.postalCode || '',
    country: shippingAddress?.country || 'United States',
    phone: shippingAddress?.phone || '',
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    toast({
      variant: 'destructive',
      title: 'Please login',
      description: 'You need to be logged in to checkout',
    });
    navigate('/login');
    return null;
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingAddress(shippingForm);
    setActiveStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveStep('review');
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      const orderData = {
        orderItems: items.map((item) => ({
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          product: item.id,
        })),
        shippingAddress: shippingForm,
        paymentMethod: paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shippingCost,
        totalPrice: totalPrice,
      };

      const response = await ordersApi.create(orderData);

      // Clear cart and redirect to success page
      clearCart();
      toast({
        title: 'Order placed successfully!',
        description: 'Thank you for your purchase.',
      });

      navigate(`/order-confirmation/${response.data._id}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Order failed',
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center ${
                  activeStep === 'shipping' ? 'text-brown' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    activeStep === 'shipping'
                      ? 'border-brown bg-brown text-white'
                      : 'border-muted-foreground'
                  }`}
                >
                  <Truck className="h-5 w-5" />
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Shipping</span>
              </div>

              <div className="w-16 h-0.5 bg-border" />

              <div
                className={`flex items-center ${
                  activeStep === 'payment' ? 'text-brown' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    activeStep === 'payment'
                      ? 'border-brown bg-brown text-white'
                      : 'border-muted-foreground'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Payment</span>
              </div>

              <div className="w-16 h-0.5 bg-border" />

              <div
                className={`flex items-center ${
                  activeStep === 'review' ? 'text-brown' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    activeStep === 'review'
                      ? 'border-brown bg-brown text-white'
                      : 'border-muted-foreground'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Review</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Forms */}
            <div className="lg:col-span-2">
              <Tabs value={activeStep} className="w-full">
                {/* Shipping Tab */}
                <TabsContent value="shipping">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Truck className="mr-2 h-5 w-5" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleShippingSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            required
                            value={shippingForm.fullName}
                            onChange={(e) =>
                              setShippingForm({ ...shippingForm, fullName: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            required
                            value={shippingForm.phone}
                            onChange={(e) =>
                              setShippingForm({ ...shippingForm, phone: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="address">Street Address *</Label>
                          <Input
                            id="address"
                            required
                            value={shippingForm.address}
                            onChange={(e) =>
                              setShippingForm({ ...shippingForm, address: e.target.value })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              required
                              value={shippingForm.city}
                              onChange={(e) =>
                                setShippingForm({ ...shippingForm, city: e.target.value })
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="postalCode">Postal Code *</Label>
                            <Input
                              id="postalCode"
                              required
                              value={shippingForm.postalCode}
                              onChange={(e) =>
                                setShippingForm({ ...shippingForm, postalCode: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="country">Country *</Label>
                          <Input
                            id="country"
                            required
                            value={shippingForm.country}
                            onChange={(e) =>
                              setShippingForm({ ...shippingForm, country: e.target.value })
                            }
                          />
                        </div>

                        <Button type="submit" className="w-full">
                          Continue to Payment
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePaymentSubmit} className="space-y-6">
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                          <div className="flex items-center space-x-2 border p-4 rounded-lg">
                            <RadioGroupItem value="card" id="card" />
                            <Label htmlFor="card" className="flex-1 cursor-pointer">
                              Credit / Debit Card
                            </Label>
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="flex items-center space-x-2 border p-4 rounded-lg">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                              PayPal
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2 border p-4 rounded-lg">
                            <RadioGroupItem value="cod" id="cod" />
                            <Label htmlFor="cod" className="flex-1 cursor-pointer">
                              Cash on Delivery
                            </Label>
                          </div>
                        </RadioGroup>

                        {paymentMethod === 'card' && (
                          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                            <div>
                              <Label htmlFor="cardNumber">Card Number *</Label>
                              <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                required
                                maxLength={16}
                                value={paymentForm.cardNumber}
                                onChange={(e) =>
                                  setPaymentForm({ ...paymentForm, cardNumber: e.target.value })
                                }
                              />
                            </div>

                            <div>
                              <Label htmlFor="cardName">Cardholder Name *</Label>
                              <Input
                                id="cardName"
                                placeholder="John Doe"
                                required
                                value={paymentForm.cardName}
                                onChange={(e) =>
                                  setPaymentForm({ ...paymentForm, cardName: e.target.value })
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expiryDate">Expiry Date *</Label>
                                <Input
                                  id="expiryDate"
                                  placeholder="MM/YY"
                                  required
                                  maxLength={5}
                                  value={paymentForm.expiryDate}
                                  onChange={(e) =>
                                    setPaymentForm({ ...paymentForm, expiryDate: e.target.value })
                                  }
                                />
                              </div>

                              <div>
                                <Label htmlFor="cvv">CVV *</Label>
                                <Input
                                  id="cvv"
                                  placeholder="123"
                                  required
                                  maxLength={3}
                                  value={paymentForm.cvv}
                                  onChange={(e) =>
                                    setPaymentForm({ ...paymentForm, cvv: e.target.value })
                                  }
                                />
                              </div>
                            </div>

                            <div className="flex items-center text-sm text-muted-foreground">
                              <Lock className="h-4 w-4 mr-2" />
                              Your payment information is secure and encrypted
                            </div>
                          </div>
                        )}

                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveStep('shipping')}
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button type="submit" className="flex-1">
                            Review Order
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Review Tab */}
                <TabsContent value="review">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Review Your Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Address */}
                      <div>
                        <h3 className="font-semibold mb-2">Shipping Address</h3>
                        <div className="bg-muted/30 p-4 rounded-lg text-sm">
                          <p>{shippingForm.fullName}</p>
                          <p>{shippingForm.address}</p>
                          <p>
                            {shippingForm.city}, {shippingForm.postalCode}
                          </p>
                          <p>{shippingForm.country}</p>
                          <p>{shippingForm.phone}</p>
                        </div>
                        <Button
                          variant="link"
                          onClick={() => setActiveStep('shipping')}
                          className="mt-2 p-0 h-auto"
                        >
                          Edit
                        </Button>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h3 className="font-semibold mb-2">Payment Method</h3>
                        <div className="bg-muted/30 p-4 rounded-lg text-sm capitalize">
                          <p>{paymentMethod.replace('_', ' ')}</p>
                        </div>
                        <Button
                          variant="link"
                          onClick={() => setActiveStep('payment')}
                          className="mt-2 p-0 h-auto"
                        >
                          Edit
                        </Button>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold mb-2">Order Items</h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between bg-muted/30 p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/api/placeholder/48/48';
                                  }}
                                />
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <p className="font-semibold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveStep('payment')}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handlePlaceOrder}
                          disabled={loading}
                          className="flex-1"
                        >
                          {loading ? 'Placing Order...' : 'Place Order'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">
                        {shippingCost === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `$${shippingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-brown">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✓ Secure checkout</p>
                    <p>✓ 30-day return policy</p>
                    <p>✓ 2-year warranty</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;