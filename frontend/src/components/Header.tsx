import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, ShoppingCart, Search, User, ChevronDown } from 'lucide-react';
import gladiusLogo from '@/assets/gladius-logo.png';
import { useCart } from '@/hooks/useCart';

const Header = () => {
  const { cartCount } = useCart();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const knifeCollections = [
    { name: 'Hunting Knives', href: '/knives/hunting' },
    { name: 'Chef Knives', href: '/knives/chef' },
    { name: 'Bushcraft Knives', href: '/knives/bushcraft' },
    { name: 'Skinner Knives', href: '/knives/skinner' },
    { name: 'Loveless Knives', href: '/knives/loveless' },
    { name: 'Chopper Knives', href: '/knives/chopper' },
    { name: 'Fillet Knives', href: '/knives/fillet' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={gladiusLogo} 
              alt="Gladius Traders Logo" 
              className="h-10 w-10 object-contain"
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
                {knifeCollections.map((collection) => (
                  <DropdownMenuItem key={collection.name} asChild>
                    <Link
                      to={collection.href}
                      className="w-full text-sm text-foreground hover:text-brown transition-smooth cursor-pointer"
                    >
                      {collection.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-lg font-medium text-foreground hover:text-brown transition-smooth px-4 py-2 rounded-lg hover:bg-secondary"
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Mobile Collections */}
                  <div className="px-4 py-2">
                    <h3 className="text-lg font-medium text-foreground mb-2">Collections</h3>
                    <div className="space-y-2 ml-4">
                      {knifeCollections.map((collection) => (
                        <Link
                          key={collection.name}
                          to={collection.href}
                          className="block text-base text-muted-foreground hover:text-brown transition-smooth py-1"
                        >
                          {collection.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;