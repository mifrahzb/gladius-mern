import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

const KnifeDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Mock data - will be replaced with actual product data
  const knife = {
    id: id,
    name: 'Loveless Hunter Damascus',
    category: 'Hunting Knife',
    price: 299,
    originalPrice: 399,
    rating: 4.9,
    reviewCount: 156,
    inStock: true,
    stockCount: 8,
    images: [
      '/api/placeholder/600/600',
      '/api/placeholder/600/600',
      '/api/placeholder/600/600',
      '/api/placeholder/600/600'
    ],
    description: 'Introducing our Loveless Knife crafted from 440c Stainless Steel, featuring elegant black Micarta handle and exquisite Mirror Polish finishing. This exceptional piece represents the perfect fusion of traditional Pakistani craftsmanship and modern design.',
    specifications: {
      'Blade Material': '440c Stainless Steel',
      'Handle Material': 'Black Micarta',
      'Overall Length': '7.17 inches',
      'Blade Length': '3.5 inches',
      'Blade Width': '1.3 inches',
      'Weight': '4.2 oz',
      'Finish': 'Mirror Polish',
      'Sheath': 'Cow Leather Black',
      'Origin': 'Handmade in Wazirabad, Pakistan'
    },
    features: [
      'Hand-forged Damascus steel blade',
      'Full tang construction for durability',
      'Ergonomic Micarta handle for secure grip',
      'Mirror polish finish for corrosion resistance',
      'Premium leather sheath included',
      'Lifetime sharpening service'
    ]
  };

  const reviews = [
    {
      name: 'John Smith',
      rating: 5,
      date: '2024-01-15',
      verified: true,
      comment: 'Exceptional quality knife. The balance and sharpness are outstanding. Perfect for field dressing deer.'
    },
    {
      name: 'Mike Johnson',
      rating: 5,
      date: '2024-01-10',
      verified: true,
      comment: 'Beautiful craftsmanship. The Damascus pattern is gorgeous and it holds an edge incredibly well.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
              <img
                src={knife.images[selectedImage]}
                alt={knife.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {knife.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-brown' : 'border-border'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${knife.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <Badge className="mb-2">{knife.category}</Badge>
              <h1 className="text-3xl font-bold text-foreground mb-2">{knife.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(knife.rating) ? 'fill-brown text-brown' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="font-medium">{knife.rating}</span>
                <span className="text-muted-foreground">({knife.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-brown">${knife.price}</span>
              {knife.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">${knife.originalPrice}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {knife.inStock ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">In Stock ({knife.stockCount} available)</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border border-border rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-secondary"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-border">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-secondary"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="cta" 
                  size="lg" 
                  className="flex-1"
                  onClick={() => addToCart({
                    id: id || '1',
                    name: knife.name,
                    price: knife.price,
                    image: knife.images[0],
                    category: knife.category
                  })}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart - ${knife.price * quantity}
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Truck className="h-6 w-6 text-brown mx-auto mb-2" />
                <div className="text-sm font-medium">Free Shipping</div>
                <div className="text-xs text-muted-foreground">Orders over $150</div>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-brown mx-auto mb-2" />
                <div className="text-sm font-medium">Authentic</div>
                <div className="text-xs text-muted-foreground">Handmade guarantee</div>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 text-brown mx-auto mb-2" />
                <div className="text-sm font-medium">30-Day Returns</div>
                <div className="text-xs text-muted-foreground">Easy returns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {knife.description}
                  </p>
                  <h3 className="font-bold text-foreground mb-4">Key Features:</h3>
                  <ul className="space-y-2">
                    {knife.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-brown rounded-full mr-3"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(knife.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border">
                        <span className="font-medium text-foreground">{key}:</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-medium text-foreground">{review.name}</div>
                          <div className="text-sm text-muted-foreground">{review.date}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'fill-brown text-brown' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-4">Shipping Information</h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>• Free shipping on orders over $150</p>
                    <p>• Standard shipping: 5-7 business days ($9.99)</p>
                    <p>• Express shipping: 2-3 business days ($19.99)</p>
                    <p>• All knives are carefully packaged and insured</p>
                    <p>• Tracking information provided via email</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default KnifeDetail;