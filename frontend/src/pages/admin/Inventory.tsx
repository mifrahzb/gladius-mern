import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Plus, Minus } from 'lucide-react';

const Inventory = () => {
  const inventory = [
    { id: 1, name: 'Damascus Hunter Knife', sku: 'DMH-001', stock: 12, reorderLevel: 5, status: 'In Stock' },
    { id: 2, name: 'Chef Master Pro', sku: 'CMP-002', stock: 3, reorderLevel: 5, status: 'Low Stock' },
    { id: 3, name: 'Tactical Folder', sku: 'TF-003', stock: 15, reorderLevel: 5, status: 'In Stock' },
    { id: 4, name: 'Damascus Chef Set', sku: 'DCS-004', stock: 0, reorderLevel: 5, status: 'Out of Stock' },
    { id: 5, name: 'Utility Pocket Knife', sku: 'UPK-005', stock: 22, reorderLevel: 10, status: 'In Stock' },
  ];

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
      <Card className="mb-6 border-yellow-300 bg-yellow-50">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-900">Low Stock Alert</p>
            <p className="text-sm text-yellow-800">2 products are below reorder level</p>
          </div>
        </CardContent>
      </Card>

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
                {inventory.map((item) => {
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
                          <Button variant="outline" size="sm">
                            <Minus className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                          <Input 
                            type="number" 
                            className="w-16 h-8 text-center" 
                            defaultValue={1}
                            min={1}
                          />
                          <Button variant="outline" size="sm">
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
