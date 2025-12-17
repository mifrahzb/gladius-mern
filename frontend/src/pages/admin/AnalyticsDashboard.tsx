import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  ShoppingCart, 
  DollarSign,
  Clock,
  MousePointer,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics-dashboard', timeRange],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${API_URL}/api/analytics/dashboard? days=${timeRange}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p>Loading analytics... </p>
        </div>
      </div>
    );
  }

  const stats = analyticsData || {};
  const behavior = stats.behaviorAnalysis || {};

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            User behavior insights and performance metrics
          </p>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              User visits in {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Session Duration
            </CardTitle>
            <Clock className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(behavior.avgSessionDuration || 0)}s
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Time spent per visit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cart Abandonment
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.cartAbandonment?. rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.cartAbandonment?.abandoned || 0} of {stats.cartAbandonment?.total || 0} carts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Peak Hours
            </CardTitle>
            <MousePointer className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {behavior.peakHours?.[0] || 'N/A'}: 00
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Most active time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Viewed Products */}
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Top Viewed Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {behavior.mostViewedProducts && behavior.mostViewedProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={behavior.mostViewedProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Click Hotspots */}
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-purple-600" />
              Click Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent>
            {behavior.clickHotspots && behavior.clickHotspots.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={behavior.clickHotspots}
                    dataKey="views"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {behavior.clickHotspots.map((entry:  any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {behavior.recommendations && behavior.recommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              AI-Powered Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {behavior.recommendations. map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{rec}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;