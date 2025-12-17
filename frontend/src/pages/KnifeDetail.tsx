import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { reviewsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ProductReviews } from '@/components/ProductReviews';
import { useWishlist } from '@/context/WishlistContext';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { trackProductView } from '@/lib/analytics';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const KnifeDetail = () => {
  const { categorySlug, productSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [knife, setKnife] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const inWishlist = knife ? isInWishlist(knife._id) : false;

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!categorySlug || !productSlug) {
        setError('Invalid product URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // FIXED: Remove duplicate /api - check if API_URL already has /api
        const baseUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL;
        const url = `${baseUrl}/api/products/${categorySlug}/${productSlug}`;
        console.log('Fetching product from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Product not found (${response.status})`);
        }
        
        const data = await response.json();
        setKnife(data);
        
        // Track product view for analytics
        if (data._id) {
          trackProductView(data._id);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error instanceof Error ? error.message : 'Failed to load product');
        toast({
          variant: 'destructive',
          title: 'Error loading product',
          description: error instanceof Error ? error.message : 'Failed to load product details',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [categorySlug, productSlug, toast]);

  const fetchReviews = async () => {
    try {
      if (!knife?._id) return;
      
      console.log('📝 Fetching reviews for product:', knife._id);
      const response = await reviewsApi.getByProduct(knife._id);
      const reviewsData = response.data?.reviews || response.data || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('❌ Reviews error:', error);
      }
      setReviews([]);
    }
  };
  
  useEffect(() => {
    if (knife?._id) {
      fetchReviews();
    }
  }, [knife?._id]);

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!knife || !reviewForm.rating || !reviewForm.comment.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide both a rating and comment for your review.',
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: knife._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        }),
      });

      if (response.ok) {
        toast({
          title: 'Review submitted',
          description: 'Thank you for your review!',
        });
        setReviewForm({ rating: 0, comment: '' });
        fetchReviews();
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

  const getImageUrl = (img: any) => {
    if (typeof img === 'string') return img;
    if (img?.url) return img.url;
    return 'https://images.unsplash.com/photo-1595435742656-5272d0b3e8f8?w=600&h=400&fit=crop';
  };

  const getImageAlt = (index: number = 0) => {
    if (!knife) return '';
    
    if (knife.imageAlts?.[index]?.altText) {
      return knife.imageAlts[index].altText;
    }
    
    const categoryName = knife.category?.name || 'Knife';
    if (index === 0) {
      return `${knife.name} - Handcrafted ${categoryName} from Wazirabad, Pakistan`;
    }
    return `${knife.name} ${categoryName} - View ${index + 1}`;
  };

  // Filter and format relevant specifications ONLY
  const getRelevantSpecs = () => {
    if (!knife) return [];
    
    const specs: { label: string; value: string }[] = [];
    
    // Use specifications object first
    if (knife.specifications) {
      if (knife.specifications.bladeLength) {
        specs.push({ label: 'Blade Length', value: knife.specifications.bladeLength });
      }
      if (knife.specifications.handleLength) {
        specs.push({ label: 'Handle Length', value: knife.specifications.handleLength });
      }
      if (knife.specifications.totalLength) {
        specs.push({ label: 'Total Length', value: knife.specifications.totalLength });
      }
      if (knife.specifications.weight) {
        specs.push({ label: 'Weight', value: knife.specifications.weight });
      }
      if (knife.specifications.bladeFinish) {
        specs.push({ label: 'Blade Finish', value: knife.specifications.bladeFinish });
      }
      if (knife.specifications.handleMaterial) {
        specs.push({ label: 'Handle Material', value: knife.specifications.handleMaterial });
      }
    }
    
    // Fallback to old fields if specifications object is empty
    if (specs.length === 0) {
      if (knife.lengthBlade) {
        specs.push({ label: 'Blade Length', value: knife.lengthBlade });
      }
      if (knife.lengthHandle) {
        specs.push({ label: 'Handle Length', value: knife.lengthHandle });
      }
      if (knife.bladeLength) {
        specs.push({ label: 'Total Length', value: knife.bladeLength });
      }
      if (knife.packageWeight) {
        specs.push({ label: 'Weight', value: `${knife.packageWeight}g (${(knife.packageWeight / 28.35).toFixed(2)} oz)` });
      }
      if (knife.finishing) {
        specs.push({ label: 'Blade Finish', value: knife.finishing });
      }
      if (knife.handle) {
        specs.push({ label: 'Handle Material', value: knife.handle });
      }
    }
    
    return specs;
  };

  const getStructuredData = () => {
    if (!knife) return null;

    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": knife.name,
      "image": knife.images?.map((img: any) => getImageUrl(img)) || [],
      "description": knife.description,
      "sku": knife._id,
      "brand": {
        "@type": "Brand",
        "name": knife.brand || "Gladius Traders"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "USD",
        "price": knife.price,
        "availability": knife.countInStock > 0 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      },
      "aggregateRating": knife.rating > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": knife.rating,
        "reviewCount": knife.numReviews
      } : undefined
    };
  };

  // Loading State - New improved loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brown border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error State - New improved error UI
  if (error || !knife) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || 'The product you are looking for does not exist.'}
          </p>
          <Button 
            onClick={() => navigate('/collections')}
            className="bg-brown hover:bg-brown/90"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collections
          </Button>
        </div>
      </div>
    );
  }

  const categoryName = knife.category?.name || 'Knives';
  const relevantSpecs = getRelevantSpecs();

  return (
    <>
      {/* SEO Meta Tags & Structured Data */}
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{knife.metaTitle || `${knife.name} | Gladius Traders`}</title>
        <meta 
          name="description" 
          content={knife.metaDescription || knife.description?.substring(0, 155)} 
        />
        
        {/* Keywords */}
        {knife.metaKeywords && knife.metaKeywords.length > 0 && (
          <meta name="keywords" content={knife.metaKeywords.join(', ')} />
        )}
        
        {/* Canonical URL */}
        <link 
          rel="canonical" 
          href={`${window.location.origin}/product/${categorySlug}/${productSlug}`} 
        />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={knife.ogTitle || knife.name} />
        <meta 
          property="og:description" 
          content={knife.ogDescription || knife.metaDescription} 
        />
        <meta property="og:image" content={knife.ogImage || getImageUrl(knife.images?.[0])} />
        <meta 
          property="og:url" 
          content={`${window.location.origin}/product/${categorySlug}/${productSlug}`} 
        />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={knife.name} />
        <meta name="twitter:description" content={knife.metaDescription} />
        <meta name="twitter:image" content={getImageUrl(knife.images?.[0])} />
        
        {/* Product Schema (JSON-LD) */}
        {knife.structuredData?.productSchema && (
          <script type="application/ld+json">
            {JSON.stringify(knife.structuredData.productSchema)}
          </script>
        )}
        
        {/* FAQ Schema (JSON-LD) */}
        {knife.structuredData?.faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(knife.structuredData.faqSchema)}
          </script>
        )}
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type":  "ListItem",
                "position": 1,
                "name": "Home",
                "item": window.location.origin
              },
              {
                "@type": "ListItem",
                "position":  2,
                "name":  knife.category?.name || "Products",
                "item": `${window.location.origin}/collections`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": knife.name,
                "item": window.location.href
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <SEO
          title={knife.metaTitle || `${knife.name} - Handcrafted ${categoryName}`}
          description={knife.metaDescription || knife.description}
          keywords={knife.metaKeywords || [knife.name, categoryName, 'handcrafted knife', 'Wazirabad', 'Pakistan']}
          image={getImageUrl(knife.images?.[0])}
          url={`/product/${categorySlug}/${knife.slug}`}
          type="product"
          schema={getStructuredData()}
        />

        <Header />
        
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Button variant="ghost" onClick={() => navigate('/collections')} className="p-0 h-auto hover:text-brown">
              Collections
            </Button>
            <ArrowRight className="h-4 w-4" />
            <Button variant="ghost" onClick={() => navigate(`/knives/${categorySlug}`)} className="p-0 h-auto hover:text-brown">
              {categoryName}
            </Button>
            <ArrowRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{knife.name}</span>
          </nav>

          {/* MAIN PRODUCT SECTION - Image Left, Info + Description + Specs Right */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            
            {/* LEFT: Product Images - SMALLER, FITS PERFECTLY */}
            <div className="space-y-4">
              {/* Main Image - Smaller and contained */}
              <div className="rounded-xl overflow-hidden bg-gray-50 border border-border">
                <img
                  src={getImageUrl(knife.images?.[selectedImage])}
                  alt={getImageAlt(selectedImage)}
                  className="w-full h-[400px] object-contain p-6"
                  loading="eager"
                />
              </div>
    
              {/* Thumbnails */}
              {knife.images && knife.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {knife.images.map((img: any, idx: number) => (
                    <button
                      key={idx}
                      className={`rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                        selectedImage === idx ? 'border-brown ring-2 ring-brown ring-opacity-50' : 'border-gray-200 hover:border-brown'
                      }`}
                      onClick={() => setSelectedImage(idx)}
                      aria-label={`View image ${idx + 1} of ${knife.name}`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={getImageAlt(idx)}
                        className="w-full h-16 object-cover"
                        loading="lazy"
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
                <Badge className="mb-3 bg-brown text-white">{categoryName}</Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">{knife.name}</h1>
                
                {/* Rating */}
                {knife.rating > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex" aria-label={`Rating: ${knife.rating} out of 5 stars`}>
                      {renderRating(knife.rating)}
                    </div>
                    <span className="font-medium text-foreground">{knife.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({reviews.length} reviews)</span>
                  </div>
                )}

                <p className="text-3xl lg:text-4xl font-bold text-brown mb-6">
                  ${knife.price?.toFixed(2) || '0.00'}
                </p>

                {/* Stock Status */}
                <div className="mb-6">
                  {knife.countInStock > 0 ? (
                    <div className="inline-flex items-center text-green-600 bg-brown-50 px-4 py-2 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <span className="font-medium">In Stock</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                      <span className="font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-4 mb-6">
                  <label htmlFor="quantity" className="font-medium">Quantity:</label>
                  <div className="flex items-center border border-border rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-secondary"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span id="quantity" className="px-4 py-2 border-x border-border">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(knife.countInStock, quantity + 1))}
                      className="px-3 py-2 hover:bg-secondary"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button 
                    variant="default"
                    size="lg" 
                    className="flex-1 bg-brown hover:bg-brown/90"
                    disabled={knife.countInStock === 0}
                    onClick={() => {
                      addToCart({
                        id: knife._id,
                        name: knife.name,
                        price: knife.price,
                        image: getImageUrl(knife.images?.[0]),
                        category: categoryName,
                        countInStock: knife.countInStock
                      });
                      toast({
                        title: 'Added to cart!',
                        description: `${knife.name} x${quantity}`
                      });
                    }}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart - ${((knife.price || 0) * quantity).toFixed(2)}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleWishlist}
                    className={inWishlist ? 'text-red-500 border-red-500' : ''}
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => {
                      navigator.share?.({
                        title: knife.name,
                        text: knife.metaDescription || knife.description,
                        url: window.location.href
                      });
                    }}
                    aria-label="Share product"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border border-border mb-6">
                  <div className="text-center">
                    <Truck className="h-6 w-6 text-brown mx-auto mb-2" aria-hidden="true" />
                    <div className="text-sm font-medium">Free Shipping</div>
                    <div className="text-xs text-muted-foreground">Orders over $150</div>
                  </div>
                  <div className="text-center">
                    <Shield className="h-6 w-6 text-brown mx-auto mb-2" aria-hidden="true" />
                    <div className="text-sm font-medium">Authentic</div>
                    <div className="text-xs text-muted-foreground">Handmade guarantee</div>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="h-6 w-6 text-brown mx-auto mb-2" aria-hidden="true" />
                    <div className="text-sm font-medium">30-Day Returns</div>
                    <div className="text-xs text-muted-foreground">Easy returns</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-bold mb-3 text-foreground">Description</h3>
                {knife.richDescription ? (
                  <div 
                    className="prose max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: knife.richDescription }}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {knife.description}
                  </p>
                )}
              </div>

              {/* Specifications - ONLY RELEVANT ONES */}
              {relevantSpecs.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-xl font-bold mb-4 text-foreground">Specifications</h3>
                  <div className="space-y-3">
                    {relevantSpecs.map((spec, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center py-2 border-b border-border last:border-0"
                      >
                        <span className="font-medium text-foreground">{spec.label}</span>
                        <span className="text-muted-foreground font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* REVIEWS SECTION - FULL WIDTH BELOW, MATCHING BACKGROUND */}
          <div className="border-t border-border pt-12">
            <h2 className="text-3xl font-bold mb-8 text-foreground">Customer Reviews</h2>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted">
                <TabsTrigger value="all" className="data-[state=active]:bg-background">
                  All Reviews ({reviews.length})
                </TabsTrigger>
                <TabsTrigger value="write" className="data-[state=active]:bg-background">
                  Write a Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review: any) => (
                    <Card key={review._id} className="bg-background border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center mb-1">
                              {renderRating(review.rating)}
                            </div>
                            <p className="font-medium text-foreground">{review.user?.name || 'Anonymous'}</p>
                          </div>
                          <time className="text-sm text-muted-foreground" dateTime={review.createdAt}>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </time>
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
                {knife._id && <ProductReviews productId={knife._id} />}
                
                <Card className="bg-background border-border mt-4">
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
    </>
  );
};

export default KnifeDetail;