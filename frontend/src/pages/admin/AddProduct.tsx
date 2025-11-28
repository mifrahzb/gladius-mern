import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    countInStock: '',
    category: '',
    description: '',
    richDescription: '',
    image: null as File | null,
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
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    focusKeyword: '',
    ogTitle: '',
    ogDescription: '',
    imageAlt: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load categories'
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('price', formData.price);
      submitData.append('countInStock', formData.countInStock);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('richDescription', formData.richDescription);
      submitData.append('brand', formData.brand);
      submitData.append('isFeatured', String(formData.isFeatured));
      
      // Specifications
      submitData.append('specifications', JSON.stringify(formData.specifications));
      
      // SEO fields
      submitData.append('metaTitle', formData.metaTitle);
      submitData.append('metaDescription', formData.metaDescription);
      submitData.append('metaKeywords', formData.metaKeywords);
      submitData.append('focusKeyword', formData.focusKeyword);
      submitData.append('ogTitle', formData.ogTitle);
      submitData.append('ogDescription', formData.ogDescription);
      submitData.append('imageAlt', formData.imageAlt);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      } else if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      toast({
        title: 'Success',
        description: 'Product created successfully'
      });

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create product'
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold">Add New Product</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
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
                      placeholder="Enter product name"
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
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="countInStock">Stock Quantity *</Label>
                      <Input
                        id="countInStock"
                        type="number"
                        value={formData.countInStock}
                        onChange={(e) => setFormData(prev => ({ ...prev, countInStock: e.target.value }))}
                        placeholder="0"
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
                      placeholder="Gladius Traders"
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

            {/* Description Tab */}
            <TabsContent value="description" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="description">Plain Text Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter product description..."
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be used as a fallback and for meta descriptions
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="richDescription">Rich Text Description</Label>
                    <RichTextEditor
                      value={formData.richDescription}
                      onChange={(value) => setFormData(prev => ({ ...prev, richDescription: value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional: Add formatted text, lists, and styling
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Image Tab */}
            <TabsContent value="image" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="image">Upload Image</Label>
                    <div className="mt-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Or Enter Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageAlt">Image Alt Text</Label>
                    <Input
                      id="imageAlt"
                      value={formData.imageAlt}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageAlt: e.target.value }))}
                      placeholder="Descriptive text for the image"
                    />
                  </div>

                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                  <p className="text-sm text-muted-foreground">Only relevant knife specifications</p>
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
                        placeholder="e.g., Walnut Wood, Damascus"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="SEO title for search engines"
                    />
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Brief description for search results"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="focusKeyword">Focus Keyword</Label>
                    <Input
                      id="focusKeyword"
                      value={formData.focusKeyword}
                      onChange={(e) => setFormData(prev => ({ ...prev, focusKeyword: e.target.value }))}
                      placeholder="Main keyword for this product"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ogTitle">OG Title</Label>
                    <Input
                      id="ogTitle"
                      value={formData.ogTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
                      placeholder="Title for social media shares"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ogDescription">OG Description</Label>
                    <Textarea
                      id="ogDescription"
                      value={formData.ogDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, ogDescription: e.target.value }))}
                      placeholder="Description for social media shares"
                      rows={3}
                    />
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
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brown hover:bg-brown/90"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;