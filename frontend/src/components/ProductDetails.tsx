import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  StarHalf,
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
    handleMaterial?: string;
    bladeMaterial?: string;
    totalLength?: string;
    weight?: string;
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
        // Refresh product data to show new review
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

  // Safe data extraction
  const categoryName = typeof product.category === 'object' 
    ? product.category.name 
    : product.category;

  const mainImages = product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div>
            <div className="rounded-lg overflow-hidden mb-4 bg-gray-50">
              <img
                src={mainImages[activeImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/600/400';
                }}
              />
            </div>
            
            {/* Image Thumbnails */}
            {mainImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {mainImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`rounded border-2 overflow-hidden ${
                      activeImage === index ? 'border-brown' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-20 object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/100/80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-4">
                {categoryName || 'Uncategorized'}
              </Badge>
              
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              {/* Rating and Reviews */}
              <div className="flex items-center mb-4">
                {renderRating(product.rating)}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
                </span>
              </div>

              <p className="text-3xl font-bold text-brown mb-6">${product.price}</p>

              {/* Stock Status */}
              <div className="flex items-center mb-6">
                {product.countInStock > 0 ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <span>In Stock ({product.countInStock} available)</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <span>Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Add to Cart */}
              <Button 
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className="w-full py-6 text-lg mb-6"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-brown" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-brown" />
                  <span>2-Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span>{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              {/* Review Form */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className="p-1"
                          >
                            <Star
                              className={`h-6 w-6 ${
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
                      <label htmlFor="comment" className="block text-sm font-medium mb-2">
                        Comment
                      </label>
                      <Textarea
                        id="comment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
                {product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <Card key={review._id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center mb-1">
                              {renderRating(review.rating)}
                            </div>
                            <p className="font-medium">{review.name}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        No reviews yet. Be the first to review this product!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetails;