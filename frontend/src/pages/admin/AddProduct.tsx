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
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Gladius Traders',
    category: '',
    price: '',
    countInStock: '',
    description: '',
    richDescription: '',
    image: null as File | null,
    imageUrl: '',
    imageAlt: '',
    isFeatured: false,
    // SEO Fields
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    focusKeyword: '',
    ogTitle: '',
    ogDescription: '',
    // Specifications
    specifications: {
      bladeLength: '',
      handleMaterial: '',
      bladeMaterial: '',
      totalLength: '',
      weight: '',
      hardness: '',
      origin: 'Wazirabad, Pakistan'
    }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate SEO fields when name or description changes
  useEffect(() => {
    if (formData.name && !formData.metaTitle) {
      setFormData(prev => ({
        ...prev,
        metaTitle: `${formData.name} | Gladius Traders`
      }));
    }
    
    if (formData.name && !formData.ogTitle) {
      setFormData(prev => ({
        ...prev,
        ogTitle: formData.name
      }));
    }

    if (formData.description && !formData.metaDescription) {
      const plainText = formData.description.replace(/<[^>]*>/g, '');
      const truncated = plainText.length > 160 
        ? plainText.substring(0, 157) + '...' 
        : plainText;
      setFormData(prev => ({
        ...prev,
        metaDescription: truncated,
        ogDescription: truncated
      }));
    }

    if (formData.name && !formData.focusKeyword) {
      setFormData(prev => ({
        ...prev,
        focusKeyword: formData.name
      }));
    }
  }, [formData.name, formData.description]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-generate image alt text
      if (!formData.imageAlt && formData.name) {
        const category = categories.find(cat => cat._id === formData.category);
        const categoryName = category?.name || 'Knife';
        setFormData(prev => ({
          ...prev,
          imageAlt: `${formData.name} - Handcrafted ${categoryName} from Wazirabad, Pakistan`
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.price) {
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: 'Please fill in all required fields'
      });
      return;
    }

    if (!formData.image && !formData.imageUrl) {
      toast({
        variant: 'destructive',
        title: 'Image required',
        description: 'Please upload an image or provide an image URL'
      });
      return;
    }

    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Append basic fields
      submitData.append('name', formData.name);
      submitData.append('brand', formData.brand);
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      submitData.append('countInStock', formData.countInStock);
      submitData.append('description', formData.description);
      submitData.append('richDescription', formData.richDescription || formData.description);
      submitData.append('isFeatured', formData.isFeatured.toString());
      
      // Append image
      if (formData.image) {
        submitData.append('image', formData.image);
      } else if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }

      submitData.append('imageAlt', formData.imageAlt);
      
      // Append SEO fields
      submitData.append('metaTitle', formData.metaTitle);
      submitData.append('metaDescription', formData.metaDescription);
      if (formData.metaKeywords) {
        submitData.append('metaKeywords', formData.metaKeywords);
      }
      submitData.append('focusKeyword', formData.focusKeyword);
      submitData.append('ogTitle', formData.ogTitle);
      submitData.append('ogDescription', formData.ogDescription);
      
      // Append specifications
      submitData.append('specifications', JSON.stringify(formData.specifications));
      
      await productsApi.create(submitData);
      
      toast({
        title: 'Success!',
        description: 'Product created successfully'
      });
      
      navigate('/admin/dashboard/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create product'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/dashboard/products')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product with SEO optimization</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Damascus Steel Hunting Knife"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    required
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="99.99"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.countInStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, countInStock: e.target.value }))}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                  <Label htmlFor="featured">Feature this product on homepage</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image">Upload Image *</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
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
                  <Label htmlFor="imageAlt">Image Alt Text (SEO) *</Label>
                  <Input
                    id="imageAlt"
                    value={formData.imageAlt}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageAlt: e.target.value }))}
                    placeholder="Descriptive alt text for SEO"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Describe the image for search engines and accessibility
                  </p>
                </div>

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md rounded-lg"
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
                  <RichTextEditor
                    label="Rich Text Description (with formatting)"
                    value={formData.richDescription}
                    onChange={(content) => setFormData(prev => ({ ...prev, richDescription: content }))}
                    placeholder="Format your product description with headings, lists, and emphasis..."
                    height="400px"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use formatting to improve readability and SEO. This will be displayed on the product page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Meta Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Product Name | Gladius Traders"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.metaTitle.length}/60 characters (optimal: 50-60)
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Brief description for search engines..."
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.metaDescription.length}/160 characters (optimal: 150-160)
                  </p>
                </div>

                <div>
                  <Label htmlFor="focusKeyword">Focus Keyword</Label>
                  <Input
                    id="focusKeyword"
                    value={formData.focusKeyword}
                    onChange={(e) => setFormData(prev => ({ ...prev, focusKeyword: e.target.value }))}
                    placeholder="e.g., Damascus Hunting Knife"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Main keyword to optimize for
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaKeywords">Keywords (comma-separated)</Label>
                  <Input
                    id="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                    placeholder="knife, damascus, hunting, handcrafted"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media (Open Graph)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

          {/* Specifications Tab */}
          <TabsContent value="specifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
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
                    <Label htmlFor="bladeMaterial">Blade Material</Label>
                    <Input
                      id="bladeMaterial"
                      value={formData.specifications.bladeMaterial}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, bladeMaterial: e.target.value }
                      }))}
                      placeholder="e.g., Damascus Steel"
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

                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.specifications.weight}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, weight: e.target.value }
                      }))}
                      placeholder="e.g., 250g"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hardness">Hardness (HRC)</Label>
                    <Input
                      id="hardness"
                      value={formData.specifications.hardness}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, hardness: e.target.value }
                      }))}
                      placeholder="e.g., 58-60 HRC"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      value={formData.specifications.origin}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        specifications: { ...prev.specifications, origin: e.target.value }
                      }))}
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
            onClick={() => navigate('/admin/dashboard/products')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;