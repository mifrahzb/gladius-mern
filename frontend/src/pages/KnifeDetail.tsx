import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { productsApi, reviewsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ProductReviews } from '@/components/ProductReviews';
import { useWishlist } from '@/context/WishlistContext';

const KnifeDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [knife, setKnife] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const inWishlist = knife ? isInWishlist(knife._id) : false;

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      fetchReviews();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getById(id!);
      setKnife(response.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load product details',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsApi.getByProduct(id!);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to load reviews');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please login to add to wishlist'
      });
      return;
    }

    if (!knife) return;

    try {
      if (inWishlist) {
        await removeFromWishlist(knife._id);
        toast({ title: 'Removed from wishlist' });
      } else {
        await addToWishlist(knife._id);
        toast({ title: 'Added to wishlist!' });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!knife) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={
                  typeof knife.images?.[0] === 'string'
                    ? knife.images[0]
                    : knife.images?.[0]?.url || '/placeholder-knife.jpg'
                }
                alt={knife.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
  
            {/* Thumbnail Gallery */}
            {knife.images && knife.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {knife.images.map((img, idx) => (
                  <div key={idx} className="aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-75">
                    <img
                      src={typeof img === 'string' ? img : img.url}
                      alt={`${knife.name} view ${idx + 1}`}
                      className="h-full w-full object-cover"
                      onClick={() => setSelectedImage(idx)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{knife.category}</Badge>
              <h1 className="text-3xl font-bold text-foreground mb-2">{knife.name}</h1>
              
              {knife.rating && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(knife.rating) ? 'fill-brown text-brown' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-medium">{knife.rating}</span>
                  <span className="text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-brown">${knife.price}</span>
            </div>

            <div className="flex items-center space-x-2">
              {knife.stock > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">In Stock ({knife.stock} available)</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border border-border rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-secondary"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-border">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(knife.stock, quantity + 1))}
                    className="px-3 py-2 hover:bg-secondary"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="cta" 
                  size="lg" 
                  className="flex-1"
                  disabled={knife.stock === 0}
                  onClick={() => addToCart({
                    id: knife._id,
                    name: knife.name,
                    price: knife.price,
                    image: knife.images?.[0] || '',
                    category: knife.category
                  })}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart - ${knife.price * quantity}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleWishlist}
                  className={inWishlist ? 'text-red-500' : ''}
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Truck className="h-6 w-6 text-brown mx-auto mb-2" />
                <div className="text-sm font-medium">Free Shipping</div>
                <div className="text-xs text-muted-foreground">Orders over $150</div>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-brown mx-auto mb-2" />
                <div className="text-sm font-medium">Authentic</div>
                <div className="text-xs text-muted-foreground">Handmade guarantee</div>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 text-brown mx-auto mb-2" />
                <div className="text-sm font-medium">30-Day Returns</div>
                <div className="text-xs text-muted-foreground">Easy returns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {knife.description}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {knife.specifications && Object.entries(knife.specifications).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border">
                        <span className="font-medium text-foreground">{key}:</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-6">
                <ProductReviews productId={id!} />
                {reviews.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No reviews yet. Be the first to review this product!
                    </CardContent>
                  </Card>
                ) : (
                  reviews.map((review: any) => (
                    <Card key={review._id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-medium text-foreground">{review.user?.name || 'Anonymous'}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'fill-brown text-brown' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
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
      </div>
    </div>
  );
};

export default KnifeDetail;