import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, Menu, X, Home, Search as SearchIcon, ChevronDown } from 'lucide-react';
import gladiusLogo from '@/assets/gladius-logo.png';

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const navItems = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={gladiusLogo}
              alt="Gladius Logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-foreground">Gladius Traders</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium text-foreground hover:text-brown transition-smooth"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Collections Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium text-foreground hover:text-brown transition-smooth p-0 h-auto">
                  Collections
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-background border border-border shadow-premium">
                <DropdownMenuItem asChild>
                  <Link
                    to="/collections"
                    className="w-full text-sm font-semibold text-foreground hover:text-brown transition-smooth cursor-pointer"
                  >
                    View All
                  </Link>
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem key={category._id} asChild>
                    <Link
                      to={`/collections?category=${category.slug}`}
                      className="w-full text-sm text-foreground hover:text-brown transition-smooth cursor-pointer"
                    >
                      {category.name} Knives
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              title="Home"
            >
              <Home className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex"
              onClick={() => navigate('/search')}
              title="Search"
            >
              <SearchIcon className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/cart')}
              title="Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/login')}
              title="Account"
            >
              <User className="h-4 w-4" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium text-foreground hover:text-brown transition-smooth"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/collections"
                className="text-sm font-medium text-foreground hover:text-brown transition-smooth"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Collections
              </Link>
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/collections?category=${category.slug}`}
                  className="text-sm text-muted-foreground hover:text-brown transition-smooth pl-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name} Knives
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;