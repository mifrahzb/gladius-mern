import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const getProductImageUrl = (product: any): string => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage !== null) {
        if (typeof firstImage[0] === 'string') {
          return Object.values(firstImage).join('');
        }
        if (firstImage.url) return firstImage.url;
      }
      if (typeof firstImage === 'string') return firstImage;
    }
    if (product.image && typeof product.image === 'string') return product.image;
    return 'https://images.unsplash.com/photo-1595435742656-5272d0b3e8f8?w=400&h=300&fit=crop';
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      const response = await fetch(`/api/products?keyword=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      const productsData = data?.products || data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      
      // Update URL with search query (SEO-friendly)
      setSearchParams({ q: searchQuery });
    } catch (error) {
      console.error('Search failed:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Perform search on mount if query exists in URL
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={query ? `Search Results for "${query}"` : 'Search Products'}
        description={`Search for handcrafted knives from Wazirabad, Pakistan. ${query ? `Results for "${query}"` : ''}`}
        url={`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`}
      />
      
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Search Products</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-12">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search for knives by name, category, or description..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-32 py-6 text-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={!query.trim() || loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown mx-auto mb-4"></div>
              <p className="text-muted-foreground">Searching...</p>
            </div>
          )}

          {/* Results */}
          {!loading && searched && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {products.length > 0 
                    ? `Found ${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`
                    : `No results found for "${query}"`
                  }
                </h2>
              </div>

              {products.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product._id}
                      className="group cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => {
                        const categorySlug = product.category?.slug || 'knives';
                        navigate(`/product/${categorySlug}/${product.slug}`);
                      }}
                    >
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={getProductImageUrl(product)}
                          alt={product.name}
                          className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595435742656-5272d0b3e8f8?w=400&h=300&fit=crop';
                          }}
                        />
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-brown">${product.price}</span>
                          <Button variant="steel" size="sm">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search terms or browse all collections
                    </p>
                    <Button onClick={() => navigate('/collections')}>
                      Browse All Products
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Initial State */}
          {!loading && !searched && (
            <Card>
              <CardContent className="p-12 text-center">
                <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Search our collection</h3>
                <p className="text-muted-foreground">
                  Enter a keyword to find the perfect knife
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Search;