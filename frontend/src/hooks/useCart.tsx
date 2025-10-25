import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { cartApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { isAuthenticated } = useAuth();

  // Load cart from backend if logged in, otherwise from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartFromBackend();
    } else {
      const savedCart = localStorage.getItem('gladius_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    }
  }, [isAuthenticated]);

  // Save cart to localStorage for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('gladius_cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const fetchCartFromBackend = async () => {
    try {
      const response = await cartApi.get();
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart');
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    if (isAuthenticated) {
      try {
        await cartApi.addItem({ productId: item.id, quantity: 1 });
        await fetchCartFromBackend();
        toast({
          title: "Added to cart",
          description: `${item.name} added to your cart`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: "Error",
          description: "Failed to add item to cart",
        });
      }
    } else {
      // Local cart for non-authenticated users
      setItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });
      toast({
        title: "Added to cart",
        description: `${item.name} added to your cart`,
      });
    }
  };

  const removeFromCart = async (id: string) => {
    if (isAuthenticated) {
      try {
        await cartApi.removeItem(id);
        await fetchCartFromBackend();
        toast({
          title: "Removed from cart",
          description: "Item removed from your cart",
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: "Error",
          description: "Failed to remove item",
        });
      }
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
      toast({
        title: "Removed from cart",
        description: "Item removed from your cart",
      });
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    if (isAuthenticated) {
      try {
        await cartApi.updateItem(id, quantity);
        await fetchCartFromBackend();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: "Error",
          description: "Failed to update quantity",
        });
      }
    } else {
      setItems(prev =>
        prev.map(i => (i.id === id ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clear();
        setItems([]);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: "Error",
          description: "Failed to clear cart",
        });
      }
    } else {
      setItems([]);
      localStorage.removeItem('gladius_cart');
    }
  };

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        refreshCart: fetchCartFromBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};