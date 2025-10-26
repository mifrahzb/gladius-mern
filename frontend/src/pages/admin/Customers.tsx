import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, Mail, Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  status: string;
}

interface Review {
  id: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadReviews();
    loadCustomers();
  }, []);

  const loadReviews = () => {
    const savedReviews = localStorage.getItem('admin_reviews');
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    }
  };

  const loadCustomers = () => {
    const savedCustomers = localStorage.getItem('admin_customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  };

  const updateReviewStatus = (reviewId: string, status: 'approved' | 'rejected') => {
    const updatedReviews = reviews.map(review =>
      review.id === reviewId ? { ...review, status } : review
    );
    localStorage.setItem('admin_reviews', JSON.stringify(updatedReviews));
    setReviews(updatedReviews);
    toast({
      title: `Review ${status}`,
      description: `The review has been ${status}.`,
    });
  };

  const deleteReview = (reviewId: string) => {
    const updatedReviews = reviews.filter(review => review.id !== reviewId);
    localStorage.setItem('admin_reviews', JSON.stringify(updatedReviews));
    setReviews(updatedReviews);
    toast({
      title: "Review deleted",
      description: "The review has been permanently removed.",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customers & Reviews</h1>
        <p className="text-muted-foreground">Manage customer relationships and moderate reviews</p>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews
            {reviews.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {reviews.filter(r => r.status === 'pending').length}
              </Badge>
            )}
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

          {customers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No customers yet. Customer data will appear here when users create accounts.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left p-4 font-semibold">Customer</th>
                        <th className="text-left p-4 font-semibold">Total Orders</th>
                        <th className="text-left p-4 font-semibold">Total Spent</th>
                        <th className="text-left p-4 font-semibold">Join Date</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers
                        .filter(customer => 
                          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-muted/30">
                          <td className="p-4">
                            <div>
                              <p className="font-semibold">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.email}</p>
                            </div>
                          </td>
                          <td className="p-4 font-semibold">{customer.totalOrders}</td>
                          <td className="p-4 font-semibold">${customer.totalSpent}</td>
                          <td className="p-4 text-muted-foreground">{customer.joinDate}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              {customer.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Mail className="w-3 h-3 mr-1" />
                                Email
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          <div className="grid gap-6">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No reviews yet. Customer reviews will appear here for moderation.
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{review.productName}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <Badge 
                            variant="outline" 
                            className={
                              review.status === 'approved' 
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : review.status === 'rejected'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }
                          >
                            {review.status}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="font-semibold">{review.customerName}</p>
                      <p className="text-sm text-muted-foreground">{review.customerEmail}</p>
                    </div>
                    <p className="text-muted-foreground mb-4">{review.comment}</p>
                    <div className="flex gap-2">
                      {review.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateReviewStatus(review.id, 'approved')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateReviewStatus(review.id, 'rejected')}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => deleteReview(review.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
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
