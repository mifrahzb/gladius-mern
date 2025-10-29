import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Product interface matching MongoDB schema
interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  images?: Array<{
    url: string;
    public_id?: string;
  } | string>;
  specifications?: Record<string, any>;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching products...');
      const response = await productsApi.getAll();
      console.log('📦 API Response:', response.data);
      
      // Handle both array and paginated response formats
      let productsData: Product[];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else {
        console.warn('⚠️ Unexpected response format:', response.data);
        productsData = [];
      }
      
      console.log('✅ Products loaded:', productsData.length);
      setProducts(productsData);
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load products',
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      console.log('🗑️  Deleting product:', id);
      await productsApi.delete(id);
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      
      // Refresh products list
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete product',
      });
    }
  };

  // Helper function to get image URL
  const getImageUrl = (images?: Array<{ url: string; public_id?: string } | string>): string => {
  if (!images || images.length === 0) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3ENo Image%3C/text%3E%3C/svg%3E';
  }
  
  const firstImage = images[0];
  if (typeof firstImage === 'string') {
    return firstImage;
  }
  return firstImage.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3ENo Image%3C/text%3E%3C/svg%3E';
};

  // Filter products based on search
  const filteredProducts = Array.isArray(products) 
    ? products.filter(product =>
        product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product?.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">Manage your knife inventory</p>
        </div>
        <Button onClick={() => navigate('/admin/dashboard/products/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? `No products found matching "${searchQuery}"` 
              : 'No products found. Add your first product to get started.'}
          </p>
          {!searchQuery && (
            <Button onClick={() => navigate('/admin/dashboard/products/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getImageUrl(product.images)}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e5e5" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {product.stock === 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 capitalize">
                      {typeof product.category === 'object' ? product.category.name : product.category || 'Uncategorized'}
                    </p>
                    
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-brown">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Stock: {product.stock}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/admin/dashboard/products/edit/${product._id}`)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Products;