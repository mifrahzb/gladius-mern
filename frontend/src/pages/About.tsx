import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Mail, Shield, Award, Heart } from 'lucide-react';
import { useState } from 'react';
import gladiusLogo from '@/assets/gladius-logo.png';
import heroBackground from '@/assets/hero-background.jpg';

const About = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic will be implemented later
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="py-24 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <img 
              src={gladiusLogo} 
              alt="Gladius Logo" 
              className="h-16 mx-auto mb-8"
            />
            <h1 className="text-5xl font-bold text-white mb-6">
              About Gladius
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              Authentic handcrafted knives from the heart of Pakistan, delivered to knife enthusiasts across America.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Heritage</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                In the ancient city of Wazirabad, Pakistan, where the art of blade-making has been passed down through generations for over 500 years, our master craftsmen continue this timeless tradition. Each Gladius knife is meticulously handforged using techniques that have been refined over centuries.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                From our workshop in Wazirabad to your hands in America, every knife represents the perfect fusion of traditional Pakistani craftsmanship and modern design. Our artisans spend days perfecting each blade, ensuring that every Gladius knife meets the highest standards of quality and performance.
              </p>
              <div className="flex items-center space-x-4">
                <MapPin className="h-5 w-5 text-brown" />
                <span className="text-foreground font-medium">Handcrafted in Wazirabad, Pakistan</span>
              </div>
            </div>
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 text-brown mb-4" />
                  <h3 className="font-bold text-foreground mb-2">Authentic Craftsmanship</h3>
                  <p className="text-sm text-muted-foreground">
                    Each knife is hand-forged by skilled artisans using traditional methods passed down through generations.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <Award className="h-8 w-8 text-steel mb-4" />
                  <h3 className="font-bold text-foreground mb-2">Premium Materials</h3>
                  <p className="text-sm text-muted-foreground">
                    We use only the finest steels and handle materials, ensuring durability and performance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* From Pakistan to USA Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">From Wazirabad to Your Workshop</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full gradient-brown mx-auto mb-6 flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-slate-dark" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Crafted in Wazirabad</h3>
                <p className="text-muted-foreground">
                  In the knife-making capital of Pakistan, our master craftsmen forge each blade with centuries-old techniques, ensuring unmatched quality and authenticity.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full gradient-steel mx-auto mb-6 flex items-center justify-center">
                  <Heart className="h-10 w-10 text-slate-dark" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Sold from Shoreline, WA</h3>
                <p className="text-muted-foreground">
                  From our headquarters in Shoreline, Washington, we carefully curate and ship these exceptional knives to customers throughout the United States.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Mail className="h-12 w-12 text-brown mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">Stay Connected</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our newsletter for knife care tips, new arrivals, and exclusive offers on authentic Pakistani craftsmanship.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" variant="cta">
                Subscribe
              </Button>
            </form>
            
            <p className="text-sm text-muted-foreground mt-4">
              Join 1000+ knife enthusiasts receiving our monthly updates. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;