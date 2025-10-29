import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowRight, Grid3X3, List, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import gladiusLogo from '@/assets/gladius-logo.png';
import heroBackground from '@/assets/hero-background.jpg';
import { productsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Collections = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [knives, setKnives] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build the API URL based on selected category
      let apiUrl = '/api/products';
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        // Find the category by name to get its ID
        const category = categories.find(cat => 
          cat.name.toLowerCase() === selectedCategory.toLowerCase() || 
          cat.slug === selectedCategory
        );
        if (category) {
          params.append('category', category._id);
        }
      }
      
      if (searchQuery) {
        params.append('keyword', searchQuery);
      }
      
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      
      if (params.toString()) {
        apiUrl += `?${params.toString()}`;
      }
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      // Handle both response formats
      const productsData = data?.products || data || [];
      setKnives(Array.isArray(productsData) ? productsData : []);
      
      // Set pagination if available
      if (data?.pages) {
        setTotalPages(data.pages);
      } else if (data?.totalPages) {
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setKnives([]);
      toast({
        variant: 'destructive',
        title: 'Error loading products',
        description: 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when category, page, or categories change
  useEffect(() => {
    if (categories.length > 0 || selectedCategory === 'all') {
      fetchProducts();
    }
  }, [selectedCategory, currentPage, categories]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      if (categories.length > 0 || selectedCategory === 'all') {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build categories for filter buttons
  const categoryFilters = [
    { id: 'all', name: 'All Knives' },
    ...categories.map(cat => ({
      id: cat.slug || cat.name.toLowerCase(),
      name: `${cat.name} Knives`
    }))
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Header */}
      <section 
        className="py-16 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <img 
              src={gladiusLogo} 
              alt="Gladius Logo" 
              className="h-12 mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-white text-center mb-4">
              Knife Collections
            </h1>
            <p className="text-lg text-gray-200 text-center max-w-2xl mx-auto">
              Discover our complete range of handcrafted knives, each one forged with precision in Wazirabad, Pakistan.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search for knives by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full text-base"
            />
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categoryFilters.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "cta" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? "cta" : "outline"}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "cta" : "outline"}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : knives.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No products found matching your criteria. Try adjusting your search or filters.'
                : 'No products found. Add some products from the admin panel!'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {knives.map((knife) => (
                <Card 
                  key={knife._id} 
                  className="group cursor-pointer transition-premium hover:shadow-premium border-border bg-card"
                  onClick={() => window.location.href = `/knife/${knife._id}`}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    {knife.countInStock === 0 && (
                      <Badge className="absolute top-4 left-4 z-10 bg-red-500 text-white">
                        Out of Stock
                      </Badge>
                    )}
                    <img
                      src={knife.image || '/api/placeholder/400/300'}
                      alt={knife.name}
                      className="w-full h-48 object-cover transition-premium group-hover:scale-105"
                    />
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">{knife.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {knife.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-brown">${knife.price}</span>
                      {knife.rating && (
                        <div className="flex items-center">
                          <span className="text-sm text-brown font-medium">⭐ {knife.rating}</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="steel" 
                      className="w-full group"
                      disabled={knife.countInStock === 0}
                    >
                      {knife.countInStock > 0 ? 'View Details' : 'Out of Stock'}
                      {knife.countInStock > 0 && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "cta" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Results Info */}
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Showing {knives.length} knives 
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== 'all' && ` in ${categoryFilters.find(c => c.id === selectedCategory)?.name}`}
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </p>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Collections;