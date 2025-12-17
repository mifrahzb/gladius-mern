import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea'; // Added
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'; // Added
import { Label } from '@/components/ui/label'; // Added
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Check, 
  X, 
  TrendingUp, 
  Zap, 
  FileText, 
  Image as ImageIcon,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Edit2, // Added
  Save, // Added
  Eye, // Added
  EyeOff // Added
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Added
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Product {
  _id: string;
  name:  string;
  description: string;
  price: number;
  countInStock: number;
  category: { _id: string; name: string };
  images: any[];
  metaDescription?:  string;
  metaKeywords?: string[];
  focusKeyword?: string;
  imageAlts?: { imageUrl: string; altText: string; category?:  string }[];
  aiGeneratedDescription?: string;
  aiGeneratedMetaDescription?: string;
  aiSuggestedKeywords?: string[];
  aiKeywordIntent?: { keyword: string; intent: string }[];
  aiApprovalStatus?: 'pending' | 'approved' | 'rejected' | null;
  aiGeneratedAt?: string;
  faqs?: { question: string; answer:  string }[];
  productSchema?: any;
  faqSchema?: any;
}

interface SEOAnalysis {
  analysis: string;
  seoScore: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    grade: string;
    checks: Array<{
      name: string;
      status: string;
      points: number;
    }>;
  };
  currentSEO: {
    hasMetaDescription: boolean;
    metaDescriptionLength: number;
    descriptionLength: number;
    keywordsCount: number;
    hasImageAlts: boolean;
    imageAltsCount: number;
    hasFocusKeyword: boolean;
    hasProductSchema: boolean;
    hasFAQSchema: boolean;
  };
}

// API Functions
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const fetchProducts = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/products?limit=100`, {
      headers: getAuthHeader()
    });
    return data. products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

const generateAIContent = async (productId: string) => {
  const { data } = await axios.post(
    `${API_URL}/ai/generate/${productId}`,
    {},
    { headers: getAuthHeader() }
  );
  return data;
};

const approveAIContent = async (productId: string) => {
  const { data } = await axios. put(
    `${API_URL}/ai/approve/${productId}`,
    {},
    { headers: getAuthHeader() }
  );
  return data;
};

const rejectAIContent = async (productId: string) => {
  const { data } = await axios.put(
    `${API_URL}/ai/reject/${productId}`,
    {},
    { headers: getAuthHeader() }
  );
  return data;
};

const regenerateAIContent = async (productId: string) => {
  const { data } = await axios. put(
    `${API_URL}/ai/regenerate/${productId}`,
    {},
    { headers: getAuthHeader() }
  );
  return data;
};

const analyzeProduct = async (productId: string) => {
  const { data } = await axios.get(
    `${API_URL}/ai/analyze/${productId}`,
    { headers: getAuthHeader() }
  );
  return data;
};

const batchGenerateAI = async (productIds: string[]) => {
  const { data } = await axios.post(
    `${API_URL}/ai/batch-generate`,
    { productIds },
    { headers: getAuthHeader() }
  );
  return data;
};

// NEW: Edit AI content function
const editAIContent = async (productId: string, editedContent: {
  description?: string;
  metaDescription?: string;
  keywords?: string[];
}) => {
  const { data } = await axios.put(
    `${API_URL}/ai/edit/${productId}`,
    editedContent,
    { headers: getAuthHeader() }
  );
  return data;
};

const AIContentManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // NEW: State for editing
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedMetaDescription, setEditedMetaDescription] = useState('');
  const [editedKeywords, setEditedKeywords] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<'original' | 'ai' | 'edited'>('ai');

  // Fetch products
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['ai-products'],
    queryFn: fetchProducts,
    retry: 2
  });

  // Calculate summary
  const summary = {
    total: products.length,
    pending: products.filter((p:  Product) => p.aiApprovalStatus === 'pending').length,
    approved: products.filter((p: Product) => p.aiApprovalStatus === 'approved').length,
    rejected: products.filter((p: Product) => p.aiApprovalStatus === 'rejected').length,
    noAI: products.filter((p: Product) => !p.aiGeneratedDescription).length
  };

  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name. toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'pending') return matchesSearch && product.aiApprovalStatus === 'pending';
    if (filterStatus === 'approved') return matchesSearch && product.aiApprovalStatus === 'approved';
    if (filterStatus === 'rejected') return matchesSearch && product.aiApprovalStatus === 'rejected';
    if (filterStatus === 'no-ai') return matchesSearch && !product.aiGeneratedDescription;
    
    return matchesSearch;
  });

  // Mutations
  const generateMutation = useMutation({
    mutationFn: generateAIContent,
    onSuccess: (data) => {
      toast({
        title: '✨ AI Content Generated',
        description: `Content ready for ${data.data.productName}`,
      });
      refetch();
    },
    onError: (error:  any) => {
      toast({
        title: 'Generation Failed',
        description: error. response?.data?.message || 'Something went wrong',
        variant: 'destructive'
      });
    }
  });

  const regenerateMutation = useMutation({
    mutationFn: regenerateAIContent,
    onSuccess: (data) => {
      toast({
        title: '🔄 Content Regenerated',
        description:  `New content generated for ${data.data.productName}`,
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Regeneration Failed',
        description: error.response?. data?.message || 'Something went wrong',
        variant: 'destructive'
      });
    }
  });

  const approveMutation = useMutation({
    mutationFn: approveAIContent,
    onSuccess: () => {
      toast({
        title: '✅ Content Approved',
        description: 'AI content is now live on the website',
      });
      refetch();
      setAnalysis(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectAIContent,
    onSuccess: () => {
      toast({
        title: 'Content Rejected',
        description: 'AI content has been rejected',
      });
      refetch();
      setAnalysis(null);
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeProduct,
    onSuccess: (data) => {
      setAnalysis(data);
    }
  });

  const batchMutation = useMutation({
    mutationFn: batchGenerateAI,
    onSuccess: (data) => {
      toast({
        title: '🚀 Batch Generation Complete',
        description: `${data.summary.successful} of ${data.summary.total} products processed`,
      });
      setSelectedProducts([]);
      refetch();
    }
  });

  // NEW: Edit mutation
  const editMutation = useMutation({
    mutationFn: ({ productId, content }: { productId: string; content: any }) => 
      editAIContent(productId, content),
    onSuccess: (data) => {
      toast({
        title: '✏️ Content Saved',
        description: 'Your edits have been saved successfully',
      });
      setEditingProduct(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Save Failed',
        description: error.response?.data?.message || 'Failed to save changes',
        variant: 'destructive'
      });
    }
  });

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p:  Product) => p._id));
    }
  };

  // NEW: Open edit dialog
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditedDescription(product.aiGeneratedDescription || '');
    setEditedMetaDescription(product.aiGeneratedMetaDescription || '');
    setEditedKeywords(product.aiSuggestedKeywords || []);
    setPreviewMode('ai');
  };

  // NEW: Save edited content
  const handleSaveEdit = () => {
    if (!editingProduct) return;
    
    editMutation.mutate({
      productId: editingProduct._id,
      content: {
        description: editedDescription,
        metaDescription: editedMetaDescription,
        keywords: editedKeywords
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0f0d]">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-spin mx-auto mb-4 text-[#8B7355]" />
          <p className="text-lg text-gray-300">Loading AI Content Manager...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0f0d]">
        <Card className="bg-[#1a1f1d] border-red-900 max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-white mb-2">Failed to Load Products</h2>
            <p className="text-gray-400 mb-4">
              {error instanceof Error ? error.message : 'Unable to fetch products from the server'}
            </p>
            <Button onClick={() => refetch()} className="bg-[#8B7355] hover: bg-[#6d5a43]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0d] p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 text-white">
            <div className="bg-gradient-to-r from-[#8B7355] to-[#6d5a43] p-3 rounded-xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            AI SEO Content Manager
          </h1>
          <p className="text-gray-400 text-lg">
            Generate, review, and approve AI-powered SEO content for your products
          </p>
        </div>
        
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <Button
              onClick={() => batchMutation.mutate(selectedProducts)}
              disabled={batchMutation.isPending}
              className="bg-gradient-to-r from-[#8B7355] to-[#6d5a43] text-white shadow-lg hover:from-[#6d5a43] hover: to-[#5a4a36]"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate for {selectedProducts.length} Selected
            </Button>
          )}
          
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="icon"
            className="border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1a1f1d] border-[#2a2f2d] shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{summary.total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1a1f1d] border-orange-900/30 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-400">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{summary.pending}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1a1f1d] border-green-900/30 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-400">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{summary.approved}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1a1f1d] border-red-900/30 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-400">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{summary.rejected}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1a1f1d] border-[#8B7355]/30 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#8B7355]">
              Needs AI Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#8B7355]">{summary.noAI}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-[#1a1f1d] border-[#2a2f2d] shadow-lg">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0a0f0d] border-[#2a2f2d] text-white placeholder: text-gray-500"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px] bg-[#0a0f0d] border-[#2a2f2d] text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f1d] border-[#2a2f2d]">
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="no-ai">No AI Content</SelectItem>
              </SelectContent>
            </Select>

            {filteredProducts.length > 0 && (
              <Button
                onClick={toggleSelectAll}
                variant="outline"
                className="border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white"
              >
                {selectedProducts.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <Card className="bg-[#1a1f1d] border-[#2a2f2d] shadow-lg">
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg text-gray-400">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No products match your filters' 
                  : 'No products found.  Add products first. '}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product: Product) => (
            <ProductCard
              key={product._id}
              product={product}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
              generateMutation={generateMutation}
              regenerateMutation={regenerateMutation}
              approveMutation={approveMutation}
              rejectMutation={rejectMutation}
              analyzeMutation={analyzeMutation}
              setSelectedProduct={setSelectedProduct}
              analysis={selectedProduct === product._id ? analysis : null}
              onEdit={openEditDialog} // Added
            />
          ))
        )}
      </div>

      {/* EDIT MODAL - ADDED */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a1f1d] border-[#2a2f2d] text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">
                ✏️ Edit AI Content: {editingProduct.name}
              </DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-[#8B7355]">
                  {editingProduct.aiApprovalStatus === 'pending' ? '⏳ Pending' : 
                   editingProduct.aiApprovalStatus === 'approved' ? '✓ Approved' : '✗ Rejected'}
                </Badge>
                <Badge variant="outline" className="border-[#8B7355] text-[#8B7355]">
                  ${editingProduct.price}
                </Badge>
              </div>
            </DialogHeader>

            <Tabs defaultValue="description" className="mt-4">
              <TabsList className="bg-[#0a0f0d] border border-[#2a2f2d]">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="meta">Meta Description</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              {/* Description Tab */}
              <TabsContent value="description" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Product Description
                  </Label>
                  <Textarea
                    id="description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={12}
                    className="bg-[#0a0f0d] border-[#2a2f2d] text-white resize-none"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{editedDescription.length} characters</span>
                    <span className={editedDescription.length < 300 ? 'text-orange-500' : 
                                     editedDescription.length > 2000 ? 'text-orange-500' : 'text-green-500'}>
                      {editedDescription.length < 300 ? '⚠️ Too short' : 
                       editedDescription.length > 2000 ? '⚠️ Too long' : '✅ Good length'}
                    </span>
                  </div>
                </div>
              </TabsContent>

              {/* Meta Description Tab */}
              <TabsContent value="meta" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaDescription" className="text-white">
                    Meta Description (for search engines)
                  </Label>
                  <Textarea
                    id="metaDescription"
                    value={editedMetaDescription}
                    onChange={(e) => setEditedMetaDescription(e.target.value)}
                    rows={4}
                    className="bg-[#0a0f0d] border-[#2a2f2d] text-white resize-none"
                    placeholder="Brief description for search results (50-160 characters)"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{editedMetaDescription.length} characters</span>
                    <span className={editedMetaDescription.length < 50 ? 'text-orange-500' : 
                                     editedMetaDescription.length > 160 ? 'text-orange-500' : 'text-green-500'}>
                      {editedMetaDescription.length < 50 ? '⚠️ Too short' : 
                       editedMetaDescription.length > 160 ? '⚠️ Too long' : '✅ Perfect'}
                    </span>
                  </div>
                </div>
              </TabsContent>

              {/* Keywords Tab */}
              <TabsContent value="keywords" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Keywords</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {editedKeywords.map((keyword, index) => (
                      <Badge key={index} className="bg-[#8B7355] text-white">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add new keyword (press Enter)"
                    className="bg-[#0a0f0d] border-[#2a2f2d] text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        setEditedKeywords([...editedKeywords, e.currentTarget.value.trim()]);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <p className="text-sm text-gray-400">
                    Press Enter to add keywords. Click on a keyword to remove it.
                  </p>
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={previewMode === 'original' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('original')}
                    className={previewMode === 'original' ? 'bg-[#8B7355]' : 'border-[#2a2f2d]'}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Original
                  </Button>
                  <Button
                    variant={previewMode === 'ai' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('ai')}
                    className={previewMode === 'ai' ? 'bg-[#8B7355]' : 'border-[#2a2f2d]'}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generated
                  </Button>
                  <Button
                    variant={previewMode === 'edited' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('edited')}
                    className={previewMode === 'edited' ? 'bg-[#8B7355]' : 'border-[#2a2f2d]'}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Edited
                  </Button>
                </div>

                <div className="bg-[#0a0f0d] p-4 rounded-lg border border-[#2a2f2d]">
                  <h3 className="font-bold mb-2 text-white">Preview:</h3>
                  <p className="text-gray-300 whitespace-pre-line">
                    {previewMode === 'original' ? editingProduct.description :
                     previewMode === 'ai' ? editingProduct.aiGeneratedDescription :
                     editedDescription}
                  </p>
                </div>

                <div className="bg-[#0a0f0d] p-4 rounded-lg border border-[#2a2f2d]">
                  <h3 className="font-bold mb-2 text-white">Meta Description Preview:</h3>
                  <p className="text-gray-400 italic">
                    {previewMode === 'original' ? editingProduct.metaDescription :
                     previewMode === 'ai' ? editingProduct.aiGeneratedMetaDescription :
                     editedMetaDescription}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#2a2f2d]">
              <Button
                variant="outline"
                onClick={() => setEditingProduct(null)}
                className="border-[#2a2f2d] text-gray-400 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={editMutation.isPending}
                className="bg-gradient-to-r from-[#8B7355] to-[#6d5a43] text-white hover:from-[#6d5a43] hover:to-[#5a4a36]"
              >
                <Save className="w-4 h-4 mr-2" />
                {editMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// UPDATED Product Card Component with Edit Button
interface ProductCardProps {
  product:  Product;
  selectedProducts: string[];
  setSelectedProducts: (ids: string[]) => void;
  generateMutation: any;
  regenerateMutation: any;
  approveMutation: any;
  rejectMutation:  any;
  analyzeMutation:  any;
  setSelectedProduct:  (id: string) => void;
  analysis: SEOAnalysis | null;
  onEdit: (product: Product) => void; // Added
}

const ProductCard = ({
  product,
  selectedProducts,
  setSelectedProducts,
  generateMutation,
  regenerateMutation,
  approveMutation,
  rejectMutation,
  analyzeMutation,
  setSelectedProduct,
  analysis,
  onEdit // Added
}: ProductCardProps) => {
  const isSelected = selectedProducts.includes(product._id);

  const toggleSelect = () => {
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(id => id !== product._id));
    } else {
      setSelectedProducts([...selectedProducts, product._id]);
    }
  };

  const getStatusBadge = () => {
    if (product.aiApprovalStatus === 'approved') {
      return <Badge className="bg-green-600">✓ Approved & Live</Badge>;
    } else if (product.aiApprovalStatus === 'pending') {
      return <Badge className="bg-orange-500">⏳ Pending Review</Badge>;
    } else if (product.aiApprovalStatus === 'rejected') {
      return <Badge variant="destructive">✗ Rejected</Badge>;
    } else {
      return <Badge variant="outline" className="border-[#8B7355] text-[#8B7355]">○ No AI Content</Badge>;
    }
  };

  return (
    <Card className="bg-[#1a1f1d] border-[#2a2f2d] hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={toggleSelect}
              className="mt-1 w-5 h-5 rounded border-gray-600 cursor-pointer bg-[#0a0f0d]"
            />
            <div className="flex-1">
              <CardTitle className="text-xl mb-1 text-white">{product.name}</CardTitle>
              <CardDescription className="flex items-center gap-4 text-gray-400">
                <span className="font-semibold text-[#8B7355]">${product.price}</span>
                <span>Stock: {product.countInStock}</span>
                <span className="px-2 py-1 bg-[#0a0f0d] rounded text-xs">
                  {product.category. name}
                </span>
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Content */}
        <div className="bg-[#0a0f0d] p-4 rounded-lg border border-[#2a2f2d]">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <h4 className="font-semibold text-sm text-white">Current Description</h4>
            <span className="text-xs text-gray-500">
              ({product.description?. length || 0} chars)
            </span>
          </div>
          <p className="text-sm text-gray-400 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* AI Generated Content Preview (if exists) */}
        {product.aiGeneratedDescription && (
          <div className="bg-[#0a0f0d] p-4 rounded-lg border border-green-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              <h4 className="font-semibold text-sm text-white">AI Generated Description</h4>
              <span className="text-xs text-gray-500">
                ({product.aiGeneratedDescription.length} chars)
              </span>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">
              {product.aiGeneratedDescription}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap pt-2 border-t border-[#2a2f2d]">
          {! product.aiGeneratedDescription ?  (
            <Button
              onClick={() => generateMutation.mutate(product._id)}
              disabled={generateMutation.isPending}
              className="bg-gradient-to-r from-[#8B7355] to-[#6d5a43] text-white hover:from-[#6d5a43] hover:to-[#5a4a36]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateMutation.isPending ? 'Generating...' : 'Generate AI Content'}
            </Button>
          ) : (
            <>
              {/* EDIT BUTTON - ADDED */}
              {product.aiApprovalStatus === 'pending' && (
                <Button
                  onClick={() => onEdit(product)}
                  variant="outline"
                  className="border-blue-600 text-blue-500 hover:bg-blue-900 hover:text-blue-300"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Content
                </Button>
              )}
              
              <Button
                onClick={() => regenerateMutation.mutate(product._id)}
                disabled={regenerateMutation.isPending}
                variant="outline"
                className="border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              
              {product.aiApprovalStatus === 'pending' && (
                <>
                  <Button
                    onClick={() => approveMutation. mutate(product._id)}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve & Publish
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(product._id)}
                    disabled={rejectMutation.isPending}
                    variant="destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </>
          )}

          <Button
            onClick={() => {
              setSelectedProduct(product._id);
              analyzeMutation.mutate(product._id);
            }}
            disabled={analyzeMutation.isPending}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {analyzeMutation.isPending ? 'Analyzing...' : 'SEO Analysis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIContentManager;