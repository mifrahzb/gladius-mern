import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Shield,
  CreditCard,
  Lock
} from 'lucide-react';
import gladiusLogo from '@/assets/gladius-logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const knifeCategories = [
    { name: 'Hunting Knives', href: '/knives/hunting' },
    { name: 'Chef Knives', href: '/knives/chef' },
    { name: 'Bushcraft Knives', href: '/knives/bushcraft' },
    { name: 'Skinner Knives', href: '/knives/skinner' },
    { name: 'Loveless Knives', href: '/knives/loveless' },
    { name: 'Fillet Knives', href: '/knives/fillet' },
  ];

  const customerLinks = [
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Return Policy', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Care Instructions', href: '/care' },
    { name: 'Warranty', href: '/warranty' },
    { name: 'FAQ', href: '/faq' },
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/story' },
    { name: 'Craftsmanship', href: '/craftsmanship' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'Contact', href: '/contact' },
    { name: 'Wholesale', href: '/wholesale' },
  ];

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src={gladiusLogo} 
                alt="Gladius Traders Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-foreground">Gladius Traders</span>
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              Master craftsmen creating premium handmade knives for hunters, chefs, and outdoor enthusiasts. 
              Forged in Wazirabad, Pakistan with traditional techniques and sold exclusively in the USA.
            </p>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 text-brown" />
                Crafted in Wazirabad, Pakistan
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2 text-brown" />
                1-800-GLADIUS (452-3487)
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2 text-brown" />
                info@gladiustraders.com
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3 pt-4">
              <Button variant="ghost" size="icon" className="hover:text-brown">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-brown">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-brown">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-brown">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Knife Categories */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Knife Collections</h3>
            <div className="space-y-2">
              {knifeCategories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="block text-sm text-muted-foreground hover:text-brown transition-smooth"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Customer Care</h3>
            <div className="space-y-2">
              {customerLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block text-sm text-muted-foreground hover:text-brown transition-smooth"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Company & Newsletter */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Company</h3>
            <div className="space-y-2 mb-6">
              {companyLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block text-sm text-muted-foreground hover:text-brown transition-smooth"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="font-semibold text-foreground mb-2 text-sm">Stay Updated</h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="text-sm"
                />
                <Button variant="steel" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Bottom Footer */}
        <div className="py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {currentYear} Gladius Traders. All rights reserved.
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-xs text-muted-foreground">
                <Shield className="h-4 w-4 mr-1 text-brown" />
                Lifetime Warranty
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Lock className="h-4 w-4 mr-1 text-brown" />
                SSL Secure
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <CreditCard className="h-4 w-4 mr-1 text-brown" />
                Secure Payment
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-brown transition-smooth">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-brown transition-smooth">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;