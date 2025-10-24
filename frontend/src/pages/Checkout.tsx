import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/hooks/useCart';
import { CreditCard, Truck, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [zipCode, setZipCode] = useState('');
  const [shippingCost, setShippingCost] = useState(0);

  const calculateShipping = () => {
    // Mock shipping calculation
    if (zipCode.length === 5) {
      const cost = shippingMethod === 'express' ? 25 : 10;
      setShippingCost(cost);
      toast({
        title: "Shipping calculated",
        description: `Shipping cost: $${cost}`,
      });
    }
  };

  const handlePlaceOrder = () => {
    // Mock order placement
    toast({
      title: "Order placed successfully!",
      description: "You'll receive a confirmation email shortly.",
    });
    clearCart();
    navigate('/');
  };

  const tax = cartTotal * 0.08; // 8% tax
  const total = cartTotal + shippingCost + tax;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input type="tel" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input placeholder="123 Main St" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input placeholder="Seattle" />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WA">Washington</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ZIP Code</Label>
                    <Input 
                      placeholder="98155" 
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      onBlur={calculateShipping}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 mb-3">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Standard Shipping (5-7 days)</div>
                      <div className="text-sm text-muted-foreground">USPS / FedEx Ground</div>
                    </Label>
                    <span className="font-semibold">$10.00</span>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Express Shipping (2-3 days)</div>
                      <div className="text-sm text-muted-foreground">FedEx / UPS Express</div>
                    </Label>
                    <span className="font-semibold">$25.00</span>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 mb-3">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Credit / Debit Card</div>
                      <div className="text-sm text-muted-foreground">Stripe (Visa, Mastercard, Amex)</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 mb-3">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      <div className="font-semibold">PayPal</div>
                      <div className="text-sm text-muted-foreground">Pay with your PayPal account</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Cash on Delivery</div>
                      <div className="text-sm text-muted-foreground">Pay when you receive</div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'stripe' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label>Card Number</Label>
                      <Input placeholder="4242 4242 4242 4242" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label>CVC</Label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePlaceOrder}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Place Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
