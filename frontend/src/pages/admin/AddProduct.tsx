import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/lib/api';
import { ImageUpload } from '@/components/admin/ImageUpload';

export const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    description: '',
    stock: '',
    category: '',
    brand: '',
    material: '',
    bladeLength: '',
    images: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        bladeLength: parseFloat(formData.bladeLength)
      };

      await productsApi.create(productData);
      
      toast({
        title: 'Product created successfully!'
      });
      
      navigate('/admin/dashboard/products');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create product',
        description: error.response?.data?.message
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
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated"
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
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="stock">Stock Quantity *</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="bladeLength">Blade Length (inches)</Label>
            <Input
              id="bladeLength"
              type="number"
              step="0.1"
              value={formData.bladeLength}
              onChange={(e) => setFormData({ ...formData, bladeLength: e.target.value })}
            />
          </div>
        </div>

        {/* Category & Brand */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hunting">Hunting Knives</SelectItem>
                <SelectItem value="chef">Chef Knives</SelectItem>
                <SelectItem value="tactical">Tactical Knives</SelectItem>
                <SelectItem value="outdoor">Outdoor Knives</SelectItem>
                <SelectItem value="pocket">Pocket Knives</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
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
            placeholder="e.g., Damascus Steel, Stainless Steel"
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
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label>Product Images</Label>
          <ImageUpload
            onImagesUploaded={(images) => setFormData({ ...formData, images })}
            existingImages={formData.images}
            maxImages={5}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/admin/dashboard/products')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;