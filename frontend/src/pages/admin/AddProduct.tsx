import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Upload, Link as LinkIcon } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url'); // Default to URL
  
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
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate image
      if (uploadMethod === 'file' && !imageFile) {
        toast({
          variant: 'destructive',
          title: 'Image required',
          description: 'Please select an image file'
        });
        setLoading(false);
        return;
      }
      
      if (uploadMethod === 'url' && !formData.imageUrl) {
        toast({
          variant: 'destructive',
          title: 'Image URL required',
          description: 'Please enter an image URL'
        });
        setLoading(false);
        return;
      }
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('stock', formData.stock.toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      
      // Add image (file or URL)
      if (uploadMethod === 'file' && imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (uploadMethod === 'url' && formData.imageUrl) {
        formDataToSend.append('imageUrl', formData.imageUrl);
      }
      
      console.log('📤 Submitting product...');
      
      // Send to backend
      await productsApi.create(formDataToSend);
      
      toast({ 
        title: 'Success!',
        description: 'Product created successfully' 
      });
      
      navigate('/admin/dashboard/products');
      
    } catch (error: any) {
      console.error('❌ Create product error:', error);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
        <p className="text-muted-foreground">Fill in the details below to create a new product</p>
      </div>

      <form onSubmit={handleSubmit}>
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
                Auto-generated from product name
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
                rows={4}
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

            {/* Image Upload - Using Button Toggle Instead of Tabs */}
            <div>
              <Label className="mb-3 block">Product Image *</Label>
              
              {/* Toggle Buttons */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={uploadMethod === 'url' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('url')}
                  className="flex-1"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Image URL
                </Button>
                <Button
                  type="button"
                  variant={uploadMethod === 'file' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('file')}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>

              {/* URL Input */}
              {uploadMethod === 'url' && (
                <div className="space-y-4">
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://images.unsplash.com/photo-1595056693214-e84c0c7f3f77?w=600"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste an image URL from Unsplash or any other source
                  </p>
                  
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Preview:</p>
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-48 h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Invalid+URL';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* File Upload */}
              {uploadMethod === 'file' && (
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: JPEG, PNG, GIF, WebP • Maximum size: 5MB
                  </p>
                  
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-48 h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="mr-2">Creating...</span>
                    <span className="animate-spin">⏳</span>
                  </>
                ) : (
                  'Create Product'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/admin/dashboard/products')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddProduct;