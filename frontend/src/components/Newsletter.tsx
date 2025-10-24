import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Gift, Bell, Users, X } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // Here you would typically send the email to your backend
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-bronze/30 bg-card shadow-premium">
        <CardContent className="p-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          {!isSubmitted ? (
            <>
              <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-lg gradient-brown flex items-center justify-center mr-3">
                  <Gift className="h-5 w-5 text-slate-dark" />
                </div>
                <div>
                  <Badge className="bg-brown/20 text-brown border-brown/30 mb-1">
                    Special Offer
                  </Badge>
                  <h3 className="font-bold text-foreground text-sm">Get 10% Off</h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Join our newsletter for exclusive deals, knife care tips, and new collection updates.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm"
                  required
                />
                <Button type="submit" variant="cta" size="sm" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Get 10% Off
                </Button>
              </form>

              <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                5,000+ subscribers
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="h-12 w-12 rounded-full bg-brown/20 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-brown" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Thank You!</h3>
              <p className="text-sm text-muted-foreground">
                Check your email for your 10% discount code.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Newsletter;