import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  images: any[];
  rating: number;
  countInStock: number;
  category: any;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products/featured');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage?.url;
    }
    return product.image || 'https://images.unsplash.com/photo-1595435742656-5272d0b3e8f8?w=400&h=300&fit=crop';
  };

  if (loading) {
    return (
      <section className="py-24 bg-slate-light">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-slate-light">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-dark mb-4">
            Handcrafted Excellence
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Each knife is meticulously forged by master craftsmen in Wazirabad, Pakistan,
            using techniques passed down through generations.
          </p>
        </div>

        {/* Featured Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {products.map((product) => (
            <Card 
              key={product._id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 hover:border-brown"
              onClick={() => navigate(`/product/${product.category?.slug || 'knives'}/${product.slug}`)}
            >
              <div className="relative overflow-hidden rounded-t-lg bg-white">
                <Badge className="absolute top-4 left-4 z-10 bg-brown text-white">
                  Featured
                </Badge>
                {product.countInStock === 0 && (
                  <Badge className="absolute top-4 right-4 z-10 bg-red-500 text-white">
                    Sold Out
                  </Badge>
                )}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1595435742656-5272d0b3e8f8?w=400&h=400&fit=crop';
                    }}
                  />
                </div>
              </div>
              
              <CardContent className="p-6 bg-white">
                <h3 className="text-xl font-bold text-slate-dark mb-2 line-clamp-1 group-hover:text-brown transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-brown">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-slate-dark">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <Button 
                  variant="default" 
                  className="w-full bg-brown hover:bg-brown/90 text-white group-hover:bg-slate-dark transition-colors"
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
            className="border-2 border-brown text-brown hover:bg-brown hover:text-white transition-all"
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