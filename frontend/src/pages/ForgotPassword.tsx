import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import gladiusLogo from '@/assets/gladius-logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        toast({
          title: 'Email Sent!',
          description: 'Check your inbox for password reset instructions.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Failed to send reset email',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <img src={gladiusLogo} alt="Gladius" className="h-16 mx-auto" />
            
            {!sent ? (
              <>
                <CardTitle className="text-3xl font-bold">Forgot Password?</CardTitle>
                <CardDescription className="text-base">
                  No worries! Enter your email and we'll send you reset instructions.
                </CardDescription>
              </>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-3xl font-bold text-green-600">Email Sent!</CardTitle>
                <CardDescription className="text-base">
                  Check your inbox at <strong>{email}</strong> for password reset instructions.
                </CardDescription>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-base">Email Address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-11 py-6 text-base"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-6 text-base bg-brown hover:bg-brown/90" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="text-brown hover:underline font-medium inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Didn't receive the email?</strong> Check your spam folder or{' '}
                    <button 
                      onClick={() => setSent(false)} 
                      className="underline font-semibold"
                    >
                      try again
                    </button>
                  </p>
                </div>
                
                <Link to="/login">
                  <Button variant="outline" className="w-full py-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;