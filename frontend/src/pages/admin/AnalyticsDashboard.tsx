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
        `${API_URL}/analytics/dashboard?days=${timeRange}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 animate-pulse mx-auto mb-4 text-brown" />
          <p>Loading analytics... </p>
        </div>
      </div>
    );
  }

  const stats = analyticsData || {};
  const behavior = stats.behaviorAnalysis || {};

  // FIXED: Use theme colors instead of random bright colors
  const COLORS = [
    'hsl(30 40% 45%)',   // brown-accent
    'hsl(200 15% 35%)',  // steel-blue
    'hsl(25 35% 35%)',   // leather-brown
    'hsl(210 6% 63%)',   // warm-gray
    'hsl(200 15% 45%)'   // lighter steel
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header - FIXED:  Removed light background gradient */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <div className="gradient-brown p-3 rounded-xl shadow-steel">
              <TrendingUp className="w-8 h-8 text-slate-dark" />
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

      {/* Stats Cards - FIXED:  Consistent theme colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
            <Users className="w-4 h-4 text-brown" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              User visits tracked
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Page Views
            </CardTitle>
            <Eye className="w-4 h-4 text-steel" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalPageViews || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total pages viewed
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Session Duration
            </CardTitle>
            <Clock className="w-4 h-4 text-brown" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round(stats.avgSessionDuration / 60 || 0)}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average time on site
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bounce Rate
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round(stats.bounceRate || 0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Single page visits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts with theme colors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Most Viewed Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={behavior.topProducts || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 11% 25%)" />
                <XAxis dataKey="name" stroke="hsl(210 6% 63%)" />
                <YAxis stroke="hsl(210 6% 63%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor:  'hsl(210 11% 17%)', 
                    border: '1px solid hsl(210 11% 25%)',
                    color: 'hsl(210 11% 93%)'
                  }} 
                />
                <Bar dataKey="views" fill="hsl(30 40% 45%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={behavior.trafficSources || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="hsl(30 40% 45%)"
                  dataKey="value"
                >
                  {(behavior.trafficSources || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS. length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor:  'hsl(210 11% 17%)', 
                    border: '1px solid hsl(210 11% 25%)',
                    color: 'hsl(210 11% 93%)'
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(210 11% 93%)' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Behavior Insights */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <MousePointer className="w-5 h-5 text-brown" />
            User Behavior Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {behavior.recommendations?. map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <div className="w-2 h-2 rounded-full bg-brown mt-2"></div>
                <p className="text-foreground text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;