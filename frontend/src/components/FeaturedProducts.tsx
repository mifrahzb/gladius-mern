import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=8&featured=true');
        const data = await response.json();
        const products = data?.products || data || [];
        setFeaturedProducts(Array.isArray(products) ? products.slice(0, 8) : []);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const getProductImageUrl = (product: any): string => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage?.url) return firstImage.url;
      if (typeof firstImage === 'string') return firstImage;
    }
    if (product.image) return product.image;
    return 'https://images.unsplash.com/photo-1595435742656-5272d0b3e8f8?w=400&h=300&fit=crop';
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover our most popular handcrafted knives, trusted by hunters and chefs worldwide
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <Card 
              key={product._id}
              className="group overflow-hidden cursor-pointer hover:shadow-premium-hover transition-premium"
              onClick={() => {
                const categorySlug = product.category?.slug || 'knives';
                navigate(`/product/${categorySlug}/${product.slug}`);
              }}
            >
              {/* Product Image */}
              <div className="relative overflow-hidden bg-gray-50">
                {product.countInStock === 0 && (
                  <Badge className="absolute top-3 left-3 z-10 bg-red-500 text-white">
                    Sold Out
                  </Badge>
                )}
                {product.isFeatured && product.countInStock > 0 && (
                  <Badge className="absolute top-3 left-3 z-10 bg-brown text-white">
                    Featured
                  </Badge>
                )}
                <img
                  src={getProductImageUrl(product)}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-premium"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595435742656-5272d0b3e8f8?w=400&h=300&fit=crop';
                  }}
                />
              </div>

              {/* Product Info */}
              <CardContent className="p-6">
                <div className="mb-2">
                  <Badge variant="outline" className="text-xs border-brown text-brown">
                    {product.category?.name || 'Knife'}
                  </Badge>
                </div>
                
                <h3 className="font-bold text-lg mb-2 text-foreground line-clamp-1">
                  {product.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-brown">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-foreground">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <Button 
                  variant="default" 
                  className="w-full bg-brown hover:bg-brown/90 text-white group-hover:shadow-md transition-all"
                  disabled={product.countInStock === 0}
                >
                  {product.countInStock > 0 ? (
                    <>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/collections')}
            className="border-2 border-brown text-brown hover:bg-brown hover:text-white transition-all shadow-sm hover:shadow-premium"
          >
            View All Collection
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;