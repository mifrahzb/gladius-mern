import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, Mail, Star, Trash2, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  _id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: string;
  joinDate: string;
  reviews: Review[];
}

interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchReviews();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/dashboard/customers');
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get('/dashboard/reviews');
      setAllReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customers & Reviews</h1>
        <p className="text-muted-foreground">Manage customer relationships and reviews</p>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="customers">
            Customers ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            All Reviews ({allReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No customers found' : 'No customers yet'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{customer.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-lg font-semibold">{customer.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-lg font-semibold">${customer.totalSpent}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reviews</p>
                        <p className="text-lg font-semibold">{customer.reviews?.length || 0}</p>
                      </div>
                    </div>

                    {/* Customer Reviews */}
                    {customer.reviews && customer.reviews.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Recent Reviews</h4>
                        <div className="space-y-3">
                          {customer.reviews.slice(0, 3).map((review) => (
                            <div key={review._id} className="bg-muted/30 p-3 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium">{review.product.name}</p>
                                <div className="flex">{renderStars(review.rating)}</div>
                              </div>
                              <p className="text-sm text-muted-foreground">{review.comment}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-4">
            {allReviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              allReviews.map((review: any) => (
                <Card key={review._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{review.product.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          {review.verified && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="font-semibold">{review.user?.name}</p>
                      <p className="text-sm text-muted-foreground">{review.user?.email}</p>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Customers;