import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { productsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    countInStock: '',
    category: '',
    brand: 'Gladius Traders',
    isFeatured: false,
    specifications: {
      bladeLength: '',
      handleLength: '',
      totalLength: '',
      weight: '',
      bladeFinish: '',
      handleMaterial: '',
    },
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getById(id!);
      const product = response.data;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        countInStock: product.countInStock?.toString() || '',
        category: product.category?._id || product.category || '',
        brand: product.brand || 'Gladius Traders',
        isFeatured: product.isFeatured || false,
        specifications: {
          bladeLength: product.specifications?.bladeLength || '',
          handleLength: product.specifications?.handleLength || '',
          totalLength: product.specifications?.totalLength || '',
          weight: product.specifications?.weight || '',
          bladeFinish: product.specifications?.bladeFinish || '',
          handleMaterial: product.specifications?.handleMaterial || '',
        },
      });
      
    } catch (error: any) {
      console.error('Failed to load product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load product details'
      });
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.countInStock || !formData.category) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all required fields'
      });
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        name: formData.name,
        price: parseFloat(formData.price),
        countInStock: parseInt(formData.countInStock),
        category: formData.category,
        description: formData.description,
        brand: formData.brand,
        isFeatured: formData.isFeatured,
        specifications: formData.specifications,
      };

      await productsApi.update(id!, submitData);

      toast({
        title: 'Success',
        description: 'Product updated successfully'
      });

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update product'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/products')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="countInStock">Stock *</Label>
                      <Input
                        id="countInStock"
                        type="number"
                        value={formData.countInStock}
                        onChange={(e) => setFormData(prev => ({ ...prev, countInStock: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                    />
                    <Label htmlFor="isFeatured">Featured Product</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Knife Specifications</CardTitle>
                  <p className="text-sm text-muted-foreground">Only relevant specifications</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bladeLength">Blade Length</Label>
                      <Input
                        id="bladeLength"
                        value={formData.specifications.bladeLength}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          specifications: { ...prev.specifications, bladeLength: e.target.value }
                        }))}
                        placeholder="e.g., 4 inches"
                      />
                    </div>

                    <div>
                      <Label htmlFor="handleLength">Handle Length</Label>
                      <Input
                        id="handleLength"
                        value={formData.specifications.handleLength}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          specifications: { ...prev.specifications, handleLength: e.target.value }
                        }))}
                        placeholder="e.g., 5 inches"
                      />
                    </div>

                    <div>
                      <Label htmlFor="totalLength">Total Length</Label>
                      <Input
                        id="totalLength"
                        value={formData.specifications.totalLength}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          specifications: { ...prev.specifications, totalLength: e.target.value }
                        }))}
                        placeholder="e.g., 9 inches"
                      />
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        value={formData.specifications.weight}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          specifications: { ...prev.specifications, weight: e.target.value }
                        }))}
                        placeholder="e.g., 6.5 oz"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bladeFinish">Blade Finish</Label>
                      <Input
                        id="bladeFinish"
                        value={formData.specifications.bladeFinish}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          specifications: { ...prev.specifications, bladeFinish: e.target.value }
                        }))}
                        placeholder="e.g., Satin, Mirror Polish"
                      />
                    </div>

                    <div>
                      <Label htmlFor="handleMaterial">Handle Material</Label>
                      <Input
                        id="handleMaterial"
                        value={formData.specifications.handleMaterial}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          specifications: { ...prev.specifications, handleMaterial: e.target.value }
                        }))}
                        placeholder="e.g., Walnut Wood"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-brown hover:bg-brown/90"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;