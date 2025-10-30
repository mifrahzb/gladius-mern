import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Plus, Minus } from 'lucide-react';
import { productsApi } from '@/lib/api';

import { toast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reorderLevel: number;
  status: string;
}

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
  try {
    const response = await productsApi.getAll({ limit: 100 });
    const products = response.data.products || response.data;
    
    const inventoryItems: InventoryItem[] = products.map((product: any) => {
      const reorderLevel = 5;
      let status = 'In Stock';
      if (product.countInStock === 0) status = 'Out of Stock';
      else if (product.countInStock <= reorderLevel) status = 'Low Stock';
      
      return {
        id: product._id,
        name: product.name,
        sku: `SKU-${product._id.slice(0, 6)}`,
        stock: product.countInStock,
        reorderLevel,
        status
      };
    });
    
    setInventory(inventoryItems);
  } catch (error) {
    console.error('Failed to load inventory:', error);
  }
};

  const updateStock = async (id: string, change: number) => {
  const amount = stockChanges[id] || 1;
  try {
    const product = inventory.find(item => item.id === id);
    if (!product) return;
    
    const newStock = Math.max(0, product.stock + (change * amount));
    
    // Update via API
    await productsApi.update(id, { countInStock: newStock });
    
    // Reload inventory
    await loadInventory();
    
    toast({
      title: "Stock updated",
      description: `Inventory has been ${change > 0 ? 'increased' : 'decreased'} by ${amount}`,
    });
  } catch (error) {
    toast({
      variant: 'destructive',
      title: "Failed to update stock",
      description: "Please try again"
    });
  }
};

  const lowStockCount = inventory.filter(item => 
    item.status === 'Low Stock' || item.status === 'Out of Stock'
  ).length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, className: string }> = {
      'In Stock': { variant: 'outline', className: 'bg-green-100 text-green-800 border-green-300' },
      'Low Stock': { variant: 'outline', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      'Out of Stock': { variant: 'outline', className: 'bg-red-100 text-red-800 border-red-300' },
    };
    return variants[status] || variants['In Stock'];
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">Track and manage product stock levels</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card className="mb-6 border-yellow-300 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">Low Stock Alert</p>
              <p className="text-sm text-yellow-800">{lowStockCount} product{lowStockCount !== 1 ? 's are' : ' is'} below reorder level</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Product</th>
                  <th className="text-left p-4 font-semibold">SKU</th>
                  <th className="text-left p-4 font-semibold">Stock</th>
                  <th className="text-left p-4 font-semibold">Reorder Level</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No inventory items. Add products to manage inventory.
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => {
                  const statusConfig = getStatusBadge(item.status);
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="p-4 font-medium">{item.name}</td>
                      <td className="p-4 text-muted-foreground">{item.sku}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${
                          item.stock === 0 ? 'text-red-600' : 
                          item.stock <= item.reorderLevel ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{item.reorderLevel}</td>
                      <td className="p-4">
                        <Badge variant={statusConfig.variant} className={statusConfig.className}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStock(item.id, -1)}
                          >
                            <Minus className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                          <Input 
                            type="number" 
                            className="w-16 h-8 text-center" 
                            value={stockChanges[item.id] || 1}
                            onChange={(e) => setStockChanges({
                              ...stockChanges,
                              [item.id]: parseInt(e.target.value) || 1
                            })}
                            min={1}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStock(item.id, 1)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
