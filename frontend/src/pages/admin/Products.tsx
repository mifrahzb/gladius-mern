import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import knifeImage from '@/assets/loveless-knife.jpg';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description?: string;
  specifications?: string;
  shippingInfo?: string;
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    specifications: '',
    shippingInfo: '',
    image: knifeImage
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const savedProducts = localStorage.getItem('admin_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image: formData.image,
      description: formData.description,
      specifications: formData.specifications,
      shippingInfo: formData.shippingInfo
    };

    const updatedProducts = [...products, newProduct];
    localStorage.setItem('admin_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    setIsDialogOpen(false);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      specifications: '',
      shippingInfo: '',
      image: knifeImage
    });
    toast({
      title: "Product added successfully",
      description: `${newProduct.name} has been added to your inventory.`,
    });
  };

  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    localStorage.setItem('admin_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    toast({
      title: "Product deleted",
      description: "The product has been removed from your inventory.",
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">Manage your knife inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Hunting, Kitchen, Tactical"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed product description..."
                />
              </div>

              <div>
                <Label htmlFor="specifications">Specifications</Label>
                <Textarea
                  id="specifications"
                  rows={3}
                  value={formData.specifications}
                  onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                  placeholder="Size, weight, materials, blade length, etc."
                />
              </div>

              <div>
                <Label htmlFor="shippingInfo">Shipping Information</Label>
                <Textarea
                  id="shippingInfo"
                  rows={2}
                  value={formData.shippingInfo}
                  onChange={(e) => setFormData({...formData, shippingInfo: e.target.value})}
                  placeholder="Shipping details, dimensions, weight for shipping..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No products found. Add your first product to get started.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id}>
            <CardContent className="p-4">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">${product.price}</span>
                <span className="text-sm">Stock: {product.stock}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;