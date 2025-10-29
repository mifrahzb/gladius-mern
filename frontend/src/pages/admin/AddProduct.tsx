import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/lib/api';
import { ImageUpload } from '@/components/admin/ImageUpload';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    description: '',
    countInStock: '',
    category: '',
    brand: '',
    material: '',
    bladeLength: '',
    image: '',
    metaTitle: '',
    metaDescription: '',
    imageAlt: ''
  });

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      // Try to fetch from /api/categories or /api/products/categories
      const response = await axios.get('/api/categories').catch(() => 
        axios.get('/api/products/categories')
      );
      
      const categoriesData = response.data;
      
      // Handle both array and object responses
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else if (categoriesData.categories) {
        setCategories(categoriesData.categories);
      }
      
      console.log('✅ Categories loaded:', categoriesData);
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load categories',
        description: 'Using default categories. Please check your connection.'
      });
      
      // Fallback to default categories
      setCategories([
        { _id: 'hunting', name: 'Hunting Knives', slug: 'hunting' },
        { _id: 'chef', name: 'Chef Knives', slug: 'chef' },
        { _id: 'tactical', name: 'Tactical Knives', slug: 'tactical' },
        { _id: 'outdoor', name: 'Outdoor Knives', slug: 'outdoor' },
        { _id: 'pocket', name: 'Pocket Knives', slug: 'pocket' }
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        countInStock: parseInt(formData.countInStock),
        bladeLength: formData.bladeLength ? parseFloat(formData.bladeLength) : undefined
      };

      // Remove empty optional fields
      Object.keys(productData).forEach(key => {
        if (productData[key] === '' || productData[key] === undefined) {
          delete productData[key];
        }
      });

      console.log('📦 Submitting product data:', productData);

      await productsApi.create(productData);
      
      toast({
        title: 'Success!',
        description: 'Product created successfully!'
      });
      
      navigate('/admin/dashboard/products');
    } catch (error: any) {
      console.error('❌ Error creating product:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create product',
        description: error.response?.data?.message || error.message || 'Please check all required fields'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({ 
                  ...formData, 
                  name,
                  slug: generateSlug(name)
                });
              }}
              placeholder="e.g., Professional Chef Knife 8 inch"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug (auto-generated)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="professional-chef-knife-8-inch"
            />
          </div>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="99.99"
              required
            />
          </div>

          <div>
            <Label htmlFor="countInStock">Stock Quantity *</Label>
            <Input
              id="countInStock"
              type="number"
              min="0"
              value={formData.countInStock}
              onChange={(e) => setFormData({ ...formData, countInStock: e.target.value })}
              placeholder="50"
              required
            />
          </div>

          <div>
            <Label htmlFor="bladeLength">Blade Length (inches)</Label>
            <Input
              id="bladeLength"
              type="number"
              step="0.1"
              min="0"
              value={formData.bladeLength}
              onChange={(e) => setFormData({ ...formData, bladeLength: e.target.value })}
              placeholder="8.0"
            />
          </div>
        </div>

        {/* Category & Brand */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            {loadingCategories ? (
              <div className="text-sm text-muted-foreground">Loading categories...</div>
            ) : (
              <Select 
                value={formData.category}
                onValueChange={(value) => {
                  console.log('✅ Category selected:', value);
                  setFormData({ ...formData, category: value });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="none" disabled>No categories available</SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {categories.length} categories available
            </p>
          </div>

          <div>
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g., Gladius"
              required
            />
          </div>
        </div>

        {/* Material */}
        <div>
          <Label htmlFor="material">Blade Material</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            placeholder="e.g., Damascus Steel, Stainless Steel, Carbon Steel"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            placeholder="Detailed product description..."
            required
          />
        </div>

        {/* SEO Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">SEO Settings (Optional)</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title (60 chars max)</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="Leave empty to auto-generate"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.metaTitle.length}/60 characters
              </p>
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description (160 chars max)</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                rows={3}
                placeholder="Leave empty to auto-generate"
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.metaDescription.length}/160 characters
              </p>
            </div>

            <div>
              <Label htmlFor="imageAlt">Image Alt Text</Label>
              <Input
                id="imageAlt"
                value={formData.imageAlt}
                onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                placeholder="Description of the image for accessibility"
              />
            </div>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <Label htmlFor="image">Image URL *</Label>
          <Input
            id="image"
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://res.cloudinary.com/your-cloud/image/..."
            required
          />
          {formData.image && (
            <div className="mt-2">
              <img 
                src={formData.image} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/api/placeholder/128/128';
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading || loadingCategories}>
            {loading ? 'Creating...' : 'Create Product'}
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
      </form>
    </div>
  );
};

export default AddProduct;