import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Upload, Link as LinkIcon, ArrowLeft } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'hunting',
    imageUrl: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string>('');

  // Fetch existing product data
  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      console.log('📥 Fetching product:', id);
      const response = await productsApi.getById(id!);
      const product = response.data;
      
      console.log('✅ Product loaded:', product);
      
      // Populate form with existing data
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        category: product.category || 'hunting',
        imageUrl: product.images?.[0]?.url || product.images?.[0] || ''
      });
      
      // Set current image for display
      const existingImage = product.images?.[0]?.url || product.images?.[0] || '';
      setCurrentImage(existingImage);
      
    } catch (error: any) {
      console.error('❌ Failed to load product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load product details'
      });
      navigate('/admin/dashboard/products');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please select a JPEG, PNG, GIF, or WebP image'
        });
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Image must be less than 5MB'
        });
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      console.log('📁 New file selected:', file.name);
    }
  };

  // Update slug when name changes
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('stock', formData.stock.toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      
      // Add image based on upload method
      if (uploadMethod === 'file' && imageFile) {
        // New file uploaded
        formDataToSend.append('image', imageFile);
        console.log('📤 Uploading new image file');
      } else if (uploadMethod === 'url' && formData.imageUrl !== currentImage) {
        // URL changed
        formDataToSend.append('imageUrl', formData.imageUrl);
        console.log('🔗 Using new image URL');
      } else {
        // Keep existing image
        console.log('🖼️  Keeping existing image');
      }
      
      console.log('💾 Updating product...');
      
      // Send to backend
      await productsApi.update(id!, formDataToSend);
      
      toast({ 
        title: 'Success!',
        description: 'Product updated successfully' 
      });
      
      navigate('/admin/dashboard/products');
      
    } catch (error: any) {
      console.error('❌ Update product error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update product'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/dashboard/products')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
        <p className="text-muted-foreground">Update product details and images</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Damascus Hunter Pro"
                  />
                </div>

                {/* Slug */}
                <div>
                  <Label>Slug (URL) *</Label>
                  <Input
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="damascus-hunter-pro"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used in product URL
                  </p>
                </div>

                {/* Description */}
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detailed product description..."
                    rows={6}
                  />
                </div>

                {/* Price, Stock, Category */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Price ($) *</Label>
                    <Input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      min="0"
                      step="0.01"
                      placeholder="299.99"
                    />
                  </div>

                  <div>
                    <Label>Stock *</Label>
                    <Input
                      required
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                      min="0"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label>Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hunting">Hunting</SelectItem>
                        <SelectItem value="chef">Chef</SelectItem>
                        <SelectItem value="bushcraft">Bushcraft</SelectItem>
                        <SelectItem value="tactical">Tactical</SelectItem>
                        <SelectItem value="fillet">Fillet</SelectItem>
                        <SelectItem value="skinner">Skinner</SelectItem>
                        <SelectItem value="loveless">Loveless</SelectItem>
                        <SelectItem value="chopper">Chopper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Upload Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Image Preview */}
                {currentImage && !imagePreview && (
                  <div>
                    <p className="text-sm font-medium mb-2">Current Image:</p>
                    <img 
                      src={currentImage} 
                      alt="Current product" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}

                {/* Tabs for Upload Method */}
                <Tabs value={uploadMethod} onValueChange={(v: any) => setUploadMethod(v)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      URL
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Upload File Tab */}
                  <TabsContent value="file" className="space-y-4">
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, GIF, WebP • Max 5MB
                    </p>
                    
                    {/* New Image Preview */}
                    {imagePreview && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-green-600">New Image:</p>
                        <img 
                          src={imagePreview} 
                          alt="New preview" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-green-500"
                        />
                        <p className="text-xs text-green-600 mt-2">
                          ✓ This will replace the current image
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Image URL Tab */}
                  <TabsContent value="url" className="space-y-4">
                    <Input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="https://images.unsplash.com/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste image URL from Unsplash or other source
                    </p>
                    
                    {/* URL Preview */}
                    {formData.imageUrl && formData.imageUrl !== currentImage && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-blue-600">New Image:</p>
                        <img 
                          src={formData.imageUrl} 
                          alt="URL preview" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-blue-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Invalid+URL';
                          }}
                        />
                        <p className="text-xs text-blue-600 mt-2">
                          ✓ This will replace the current image
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? (
              <>
                <span className="mr-2">Saving Changes...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              <>
                <span>Save Changes</span>
              </>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/admin/dashboard/products')}
            disabled={saving}
            size="lg"
          >
            Cancel
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={fetchProduct}
            disabled={saving}
            size="lg"
            className="ml-auto"
          >
            Reset to Original
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;