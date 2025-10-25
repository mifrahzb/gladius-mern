import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import gladiusLogo from '@/assets/gladius-logo.png';

/**
 * SECURITY WARNING - DEMO ONLY:
 * This admin login uses localStorage for demo purposes only.
 * For production, you MUST implement:
 * 1. Server-side authentication with secure session management
 * 2. JWT tokens or OAuth
 * 3. User roles stored in a separate database table (NOT localStorage)
 * 4. Row-Level Security (RLS) policies
 * 5. HTTPS for all connections
 * 
 * Never rely on client-side storage for authentication in production!
 */

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(credentials.email, credentials.password);
      navigate('/admin/dashboard');
    } catch (error) {
      // Error is already shown by useAuth hook
      console.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={gladiusLogo} alt="Gladius" className="h-12 mx-auto mb-4" />
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gladius.com"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;