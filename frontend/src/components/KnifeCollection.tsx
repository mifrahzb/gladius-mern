import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { ArrowRight, Star, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KnifeCollection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadProducts = () => {
      const savedProducts = localStorage.getItem('admin_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    };
    loadProducts();
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Handcrafted Excellence
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover our collection of premium knives, each one meticulously crafted 
            with attention to detail and built for a lifetime of performance.
          </p>
        </div>

        {/* Main Collection Grid */}
        {products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {products.slice(0, 6).map((product, index) => (
              <Card key={index} className="group cursor-pointer transition-premium hover:shadow-premium border-border bg-card">
                <div className="relative overflow-hidden rounded-t-lg">
                  {index === 0 && (
                    <Badge className="absolute top-4 left-4 z-10 bg-brown text-slate-dark">
                      <Star className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  )}
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-premium group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-premium" />
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{product.name}</h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-brown mr-2" />
                      {product.type}
                    </div>
                    <div className="flex items-center text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-brown mr-2" />
                      {product.quantity} in stock
                    </div>
                  </div>

                  <Button 
                    variant="steel" 
                    className="w-full group"
                    onClick={() => navigate('/collections')}
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mb-16">
            <div className="h-16 w-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Products Available</h3>
            <p className="text-muted-foreground">Products will appear here once added by admin.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Button 
            variant="cta" 
            size="xl"
            onClick={() => navigate('/collections')}
          >
            View All Collections
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default KnifeCollection;