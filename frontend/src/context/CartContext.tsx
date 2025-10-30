import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  countInStock: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CartContextType {
  items: CartItem[];
  shippingAddress: ShippingAddress | null;
  paymentMethod: string;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setPaymentMethod: (method: string) => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalPrice: number;
  hasMinimumForFreeShipping: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08; // 8% tax
const SHIPPING_COST = 10.0;
const FREE_SHIPPING_MINIMUM = 150.0;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedShipping = localStorage.getItem('shippingAddress');
    const savedPayment = localStorage.getItem('paymentMethod');

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage');
      }
    }

    if (savedShipping) {
      try {
        setShippingAddress(JSON.parse(savedShipping));
      } catch (error) {
        console.error('Failed to parse shipping address');
      }
    }

    if (savedPayment) {
      setPaymentMethod(savedPayment);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (shippingAddress) {
      localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    }
  }, [shippingAddress]);

  useEffect(() => {
    localStorage.setItem('paymentMethod', paymentMethod);
  }, [paymentMethod]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      if (existingItem) {
        // Check stock before increasing quantity
        if (existingItem.quantity >= item.countInStock) {
          toast({
            variant: 'destructive',
            title: 'Out of stock',
            description: `Only ${item.countInStock} items available in stock.`,
          });
          return prevItems;
        }

        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...prevItems, { ...item, quantity: 1 }];
    });

    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast({
      title: 'Removed from cart',
      description: 'Item has been removed from your cart.',
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          // Check stock
          if (quantity > item.countInStock) {
            toast({
              variant: 'destructive',
              title: 'Out of stock',
              description: `Only ${item.countInStock} items available.`,
            });
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart.',
    });
  };

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasMinimumForFreeShipping = subtotal >= FREE_SHIPPING_MINIMUM;
  const shippingCost = hasMinimumForFreeShipping ? 0 : SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const totalPrice = subtotal + tax + shippingCost;

  return (
    <CartContext.Provider
      value={{
        items,
        shippingAddress,
        paymentMethod,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setShippingAddress,
        setPaymentMethod,
        totalItems,
        subtotal,
        tax,
        shippingCost,
        totalPrice,
        hasMinimumForFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};