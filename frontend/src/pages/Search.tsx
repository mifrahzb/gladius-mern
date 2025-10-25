import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, ArrowRight, Filter } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string, selectedCategory?: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params: any = { search: query };
      
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await productsApi.getAll(params);
      setResults(response.data);

      if (response.data.length === 0) {
        toast({
          title: 'No results found',
          description: `No products found for "${query}"`,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to search products',
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      performSearch(searchQuery, category);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    if (searchQuery.trim()) {
      performSearch(searchQuery, newCategory);
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'hunting', name: 'Hunting' },
    { id: 'chef', name: 'Chef' },
    { id: 'bushcraft', name: 'Bushcraft' },
    { id: 'tactical', name: 'Tactical' },
    { id: 'fillet', name: 'Fillet' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Search Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Search Products</h1>
            <p className="text-lg text-muted-foreground">
              Find the perfect knife for your needs
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for knives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(cat.id)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Search Results */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Found <span className="font-semibold text-foreground">{results.length}</span> results
                  {searchQuery && (
                    <> for "<span className="font-semibold text-foreground">{searchQuery}</span>"</>
                  )}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => (
                  <Card 
                    key={product._id}
                    className="group cursor-pointer transition-all hover:shadow-lg"
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      {product.stock === 0 && (
                        <Badge className="absolute top-4 left-4 z-10 bg-red-500 text-white">
                          Out of Stock
                        </Badge>
                      )}
                      {product.stock > 0 && product.stock < 5 && (
                        <Badge className="absolute top-4 left-4 z-10 bg-orange-500 text-white">
                          Low Stock
                        </Badge>
                      )}
                      <img
                        src={product.images?.[0] || '/api/placeholder/400/300'}
                        alt={product.name}
                        className="w-full h-56 object-cover transition-transform group-hover:scale-105"
                        onClick={() => window.location.href = `/knife/${product._id}`}
                      />
                    </div>
                    
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-2">
                        {product.category}
                      </Badge>
                      <h3 
                        className="text-lg font-bold text-foreground mb-2 hover:text-brown cursor-pointer"
                        onClick={() => window.location.href = `/knife/${product._id}`}
                      >
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-brown">
                          ${product.price}
                        </span>
                        {product.rating && (
                          <div className="flex items-center">
                            <span className="text-sm text-brown font-medium">
                              ⭐ {product.rating}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          className="flex-1"
                          onClick={() => window.location.href = `/knife/${product._id}`}
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          disabled={product.stock === 0}
                          onClick={() => addToCart({
                            id: product._id,
                            name: product.name,
                            price: product.price,
                            image: product.images?.[0] || '',
                            category: product.category
                          })}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : searchQuery ? (
            <Card className="p-12">
              <div className="text-center">
                <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any products matching "{searchQuery}"
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Suggestions:</p>
                  <ul className="list-disc list-inside">
                    <li>Check your spelling</li>
                    <li>Try different keywords</li>
                    <li>Try more general keywords</li>
                    <li>Browse our collections instead</li>
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => window.location.href = '/collections'}
                >
                  Browse All Products
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Start searching</h3>
                <p className="text-muted-foreground">
                  Enter keywords to find the perfect knife
                </p>
              </div>
            </Card>
          )}

          {/* Popular Searches */}
          {!searchQuery && (
            <div className="mt-12">
              <h3 className="text-lg font-semibold mb-4">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {['Damascus', 'Hunting knife', 'Chef knife', 'Tactical', 'Bushcraft', 'Fillet knife'].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(term);
                      setSearchParams({ q: term });
                      performSearch(term);
                    }}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;