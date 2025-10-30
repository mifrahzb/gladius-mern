import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { reviewsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ProductReviews } from '@/components/ProductReviews';
import { useWishlist } from '@/context/WishlistContext';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const KnifeDetail = () => {
  const { categorySlug, productSlug } = useParams();
  const navigate = useNavigate();
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
  
  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching:', categorySlug, productSlug);
      
      const response = await fetch(`/api/products/${categorySlug}/${productSlug}`);
      
      if (!response.ok) {
        throw new Error('Product not found');
      }
      
      const data = await response.json();
      console.log('✅ Product loaded:', data.name);
      console.log('✅ Product ID:', data._id);
      setKnife(data);
    } catch (error) {
      console.error('❌ Error loading product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Product not found',
      });
      navigate('/collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      if (!knife?._id) {
        console.log('⚠️ No product ID yet, skipping reviews fetch');
        return;
      }
      
      console.log('📝 Fetching reviews for product:', knife._id);
      const response = await reviewsApi.getByProduct(knife._id);
      const reviewsData = response.data?.reviews || response.data || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      console.log('✅ Reviews loaded:', reviewsData.length);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('❌ Reviews error:', error);
      }
      setReviews([]);
    }
  };

  useEffect(() => {
    if (categorySlug && productSlug) {
      fetchProductDetails();
    }
  }, [categorySlug, productSlug]);

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

  const getImageUrl = (img: any) => {
    if (typeof img === 'string') return img;
    if (img?.url) return img.url;
    return '/placeholder-knife.jpg';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!knife) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <Button onClick={() => navigate('/collections')}>
              Back to Collections
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryName = knife.category?.name || 'Knives';

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={knife.metaTitle || `${knife.name} - Handcrafted ${categoryName}`}
        description={knife.metaDescription || knife.description}
        keywords={knife.metaKeywords || [knife.name, categoryName, 'handcrafted knife', 'Wazirabad', 'Pakistan']}
        image={getImageUrl(knife.images?.[0])}
        url={`/product/${categorySlug}/${knife.slug}`}
        type="product"
        structuredData={getStructuredData()}
        canonicalUrl={knife.canonicalUrl}
      />

      <Header />
      
      <div className="container mx-auto px-4 py-8">
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

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={getImageUrl(knife.images?.[selectedImage])}
                alt={getImageAlt(selectedImage)}
                className="h-full w-full object-cover object-center"
                loading="eager"
              />
            </div>
  
            {knife.images && knife.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {knife.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    className={`aspect-square overflow-hidden rounded-md cursor-pointer border-2 transition-all ${
                      selectedImage === idx ? 'border-brown' : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`View image ${idx + 1} of ${knife.name}`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={getImageAlt(idx)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{categoryName}</Badge>
              <h1 className="text-3xl font-bold text-foreground mb-2">{knife.name}</h1>
              
              {knife.rating && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex" aria-label={`Rating: ${knife.rating} out of 5 stars`}>
                    {renderRating(knife.rating)}
                  </div>
                  <span className="font-medium">{knife.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-brown">${knife.price}</span>
            </div>

            <div className="flex items-center space-x-2">
              {knife.countInStock > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
                  <span className="text-green-600">In Stock ({knife.countInStock} available)</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></div>
                  <span className="text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
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

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="cta" 
                  size="lg" 
                  className="flex-1"
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
                  Add to Cart - ${(knife.price * quantity).toFixed(2)}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleWishlist}
                  className={inWishlist ? 'text-red-500' : ''}
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
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
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
        </div>

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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {knife.sku && (
                      <div className="space-y-1 border-b border-border pb-3">
                        <span className="text-sm font-semibold text-foreground">Product Code (SKU)</span>
                        <p className="text-muted-foreground font-mono">{knife.sku}</p>
                      </div>
                    )}
                    
                    {knife.blade && (
                      <div className="space-y-1 border-b border-border pb-3">
                        <span className="text-sm font-semibold text-foreground">Blade Material</span>
                        <p className="text-muted-foreground">{knife.blade}</p>
                      </div>
                    )}
                    
                    {knife.lengthBlade && (
                      <div className="space-y-1 border-b border-border pb-3">
                        <span className="text-sm font-semibold text-foreground">Blade Length</span>
                        <p className="text-muted-foreground">{knife.lengthBlade}</p>
                      </div>
                    )}
                    
                    {knife.lengthHandle && (
                      <div className="space-y-1 border-b border-border pb-3">
                        <span className="text-sm font-semibold text-foreground">Handle Length</span>
                        <p className="text-muted-foreground">{knife.lengthHandle}</p>
                      </div>
                    )}
                    
                    {knife.handle && (
                      <div className="space-y-1 border-b border-border pb-3">
                        <span className="text-sm font-semibold text-foreground">Handle Material</span>
                        <p className="text-muted-foreground">{knife.handle}</p>
                      </div>
                    )}
                    
                    {knife.packageWeight && (
                      <div className="space-y-1 border-b border-border pb-3">
                        <span className="text-sm font-semibold text-foreground">Weight</span>
                        <p className="text-muted-foreground">
                          {knife.packageWeight}g ({(knife.packageWeight / 28.35).toFixed(2)} oz)
                        </p>
                      </div>
                    )}
                    
                    {knife.finishing && (
                      <div className="space-y-1 border-b border-border pb-3">
                        <span className="text-sm font-semibold text-foreground">Blade Finish</span>
                        <p className="text-muted-foreground">{knife.finishing}</p>
                      </div>
                    )}
                    
                    {knife.casing && (
                      <div className="space-y-1 border-b border-border pb-3">
                        <span className="text-sm font-semibold text-foreground">Included Sheath</span>
                        <p className="text-muted-foreground">{knife.casing}</p>
                      </div>
                    )}
                    
                    {knife.brand && (
                      <div className="space-y-1 border-b border-border pb-3">
                        <span className="text-sm font-semibold text-foreground">Brand</span>
                        <p className="text-muted-foreground">{knife.brand}</p>
                      </div>
                    )}
                    
                    {knife.specifications && Object.entries(knife.specifications).map(([key, value]: [string, any]) => (
                      value && (
                        <div key={key} className="space-y-1 border-b border-border pb-3">
                          <span className="text-sm font-semibold text-foreground">
                            {key.replace(/([A-Z])/g, ' $1').trim()
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')}
                          </span>
                          <p className="text-muted-foreground">{value}</p>
                        </div>
                      )
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="bg-muted/30 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-brown" />
                        Craftsmanship & Heritage
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Handcrafted by master craftsmen in <strong>Wazirabad, Pakistan</strong> - the knife-making capital of the world since 1890. 
                        Each knife is individually forged using traditional techniques passed down through generations, combined with modern quality standards. 
                        Every piece undergoes rigorous quality inspection to ensure exceptional sharpness, balance, and durability.
                      </p>
                    </div>
                  </div>
                  
                  {!knife.blade && !knife.lengthBlade && !knife.handle && !knife.specifications && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg">Detailed specifications coming soon.</p>
                      <p className="text-sm mt-2">Contact us for more information about this product.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-6">
                {knife._id && <ProductReviews productId={knife._id} />}
                {!reviews || reviews.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No reviews yet. Be the first to review this product!
                    </CardContent>
                  </Card>
                ) : (
                  Array.isArray(reviews) && reviews.map((review: any) => (
                    <Card key={review._id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center mb-1">
                              {renderRating(review.rating)}
                            </div>
                            <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                          </div>
                          <time className="text-sm text-muted-foreground" dateTime={review.createdAt}>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </time>
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
      
      <Footer />
    </div>
  );
};

export default KnifeDetail;