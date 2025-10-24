import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Mail } from 'lucide-react';
import { useState } from 'react';

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const customers = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com',
      totalOrders: 5,
      totalSpent: 1245,
      joinDate: '2023-06-15',
      status: 'Active'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com',
      totalOrders: 12,
      totalSpent: 3890,
      joinDate: '2023-03-22',
      status: 'Active'
    },
    { 
      id: 3, 
      name: 'Bob Johnson', 
      email: 'bob@example.com',
      totalOrders: 3,
      totalSpent: 678,
      joinDate: '2023-09-10',
      status: 'Active'
    },
    { 
      id: 4, 
      name: 'Alice Brown', 
      email: 'alice@example.com',
      totalOrders: 8,
      totalSpent: 2100,
      joinDate: '2023-05-01',
      status: 'Active'
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customers</h1>
        <p className="text-muted-foreground">Manage customer relationships and reviews</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Total Orders</th>
                  <th className="text-left p-4 font-semibold">Total Spent</th>
                  <th className="text-left p-4 font-semibold">Join Date</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{customer.totalOrders}</td>
                    <td className="p-4 font-semibold">${customer.totalSpent}</td>
                    <td className="p-4 text-muted-foreground">{customer.joinDate}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
