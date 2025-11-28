import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star,
  Truck,
  Shield,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Types
interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: any;
  brand: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  reviews: Review[];
  specifications?: {
    bladeLength?: string;
    handleLength?: string;
    totalLength?: string;
    weight?: string;
    bladeFinish?: string;
    handleMaterial?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
}

const ProductDetails = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productData = await response.json();
        
        // Validate and normalize product data
        const normalizedProduct: Product = {
          ...productData,
          reviews: Array.isArray(productData.reviews) ? productData.reviews : [],
          images: Array.isArray(productData.images) 
            ? productData.images 
            : [productData.image].filter(Boolean),
          rating: Number(productData.rating) || 0,
          numReviews: Number(productData.numReviews) || 0,
          countInStock: Number(productData.countInStock) || 0,
          price: Number(productData.price) || 0,
        };

        setProduct(normalizedProduct);
        
        // Update page metadata for SEO
        document.title = normalizedProduct.metaTitle || `${normalizedProduct.name} | Gladius Knives`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', 
            normalizedProduct.metaDescription || 
            normalizedProduct.description.substring(0, 160)
          );
        }

      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading product',
          description: 'The product could not be found or loaded. Please try again.'
        });
        navigate('/collections');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate, toast]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || product.image,
      category: product.category,
      countInStock: product.countInStock,
    });

    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Handle review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !reviewForm.rating || !reviewForm.comment.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide both a rating and comment for your review.',
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
      });

      if (response.ok) {
        toast({
          title: 'Review submitted',
          description: 'Thank you for your review!',
        });
        setReviewForm({ rating: 0, comment: '' });
        window.location.reload();
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error submitting review',
        description: 'Please try again later.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Render star rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  // Filter relevant specifications
  const getRelevantSpecs = (specs: any) => {
    if (!specs) return null;
    
    const relevantKeys = [
      'bladeLength',
      'handleLength', 
      'totalLength',
      'weight',
      'bladeFinish',
      'handleMaterial'
    ];
    
    const filtered: Record<string, any> = {};
    relevantKeys.forEach(key => {
      if (specs[key]) {
        filtered[key] = specs[key];
      }
    });
    
    return Object.keys(filtered).length > 0 ? filtered : null;
  };

  // Format spec label
  const formatSpecLabel = (key: string): string => {
    const labels: Record<string, string> = {
      bladeLength: 'Blade Length',
      handleLength: 'Handle Length',
      totalLength: 'Total Length',
      weight: 'Weight',
      bladeFinish: 'Blade Finish',
      handleMaterial: 'Handle Material'
    };
    return labels[key] || key;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/collections')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Collections
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryName = typeof product.category === 'object' 
    ? product.category.name 
    : product.category;

  const mainImages = product.images.length > 0 ? product.images : [product.image];
  const relevantSpecs = getRelevantSpecs(product.specifications);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-0 h-auto">
            Home
          </Button>
          <ArrowRight className="h-4 w-4" />
          <Button variant="ghost" onClick={() => navigate('/collections')} className="p-0 h-auto">
            Collections
          </Button>
          <ArrowRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* MAIN PRODUCT SECTION - Image Left, Details Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* LEFT: Product Images - SMALLER & FITS PERFECTLY */}
          <div className="space-y-4">
            {/* Main Image - Smaller, contained */}
            <div className="rounded-xl overflow-hidden bg-gray-50 border border-border">
              <img
                src={mainImages[activeImage]}
                alt={product.name}
                className="w-full h-[400px] object-contain p-6"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1595435742656-5272d0b3e8f8?w=600&h=400&fit=crop';
                }}
              />
            </div>
            
            {/* Thumbnails */}
            {mainImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {mainImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`rounded-lg border-2 overflow-hidden transition-all ${
                      activeImage === index 
                        ? 'border-brown ring-2 ring-brown ring-opacity-50' 
                        : 'border-gray-200 hover:border-brown'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${index + 1}`}
                      className="w-full h-16 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1595435742656-5272d0b3e8f8?w=100&h=100&fit=crop';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info + Description + Specs */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <Badge variant="outline" className="mb-3 border-brown text-brown">
                {categoryName || 'Uncategorized'}
              </Badge>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-foreground">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {renderRating(product.rating)}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
                </span>
              </div>

              <p className="text-3xl lg:text-4xl font-bold text-brown mb-6">
                ${product.price.toFixed(2)}
              </p>

              {/* Stock Status */}
              <div className="mb-6">
                {product.countInStock > 0 ? (
                  <div className="inline-flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <span className="font-medium">In Stock ({product.countInStock} available)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <Button 
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className="w-full py-6 text-lg mb-6 bg-brown hover:bg-brown/90"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg border border-border mb-6">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-brown flex-shrink-0" />
                  <span className="text-sm font-medium">Free Shipping</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-brown flex-shrink-0" />
                  <span className="text-sm font-medium">2-Year Warranty</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-border pt-6">
              <h3 className="text-xl font-bold mb-3 text-foreground">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {relevantSpecs && (
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-bold mb-4 text-foreground">Specifications</h3>
                <div className="space-y-3">
                  {Object.entries(relevantSpecs).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="flex justify-between items-center py-2 border-b border-border last:border-0"
                    >
                      <span className="font-medium text-foreground">
                        {formatSpecLabel(key)}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* REVIEWS SECTION - FULL WIDTH BELOW - BACKGROUND COLOR MATCH */}
        <div className="border-t border-border pt-12">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Customer Reviews</h2>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted">
              <TabsTrigger value="all" className="data-[state=active]:bg-background">
                All Reviews ({product.reviews.length})
              </TabsTrigger>
              <TabsTrigger value="write" className="data-[state=active]:bg-background">
                Write a Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <Card key={review._id} className="bg-background border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center mb-2">
                            {renderRating(review.rating)}
                          </div>
                          <p className="font-semibold text-foreground">{review.name}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-background border-border">
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground text-lg">
                      No reviews yet. Be the first to review this product!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="write">
              <Card className="bg-background border-border">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6 text-foreground">Write Your Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3 text-foreground">Your Rating</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= reviewForm.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="comment" className="block text-sm font-medium mb-2 text-foreground">
                        Your Review
                      </label>
                      <Textarea
                        id="comment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your experience with this product..."
                        rows={6}
                        required
                        className="resize-none bg-background"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={submittingReview}
                      className="bg-brown hover:bg-brown/90 w-full sm:w-auto"
                      size="lg"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetails;