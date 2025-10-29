import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;           // Changed from _id to id
  name: string;
  price: number;
  image: string;
  category: string;     // Added category
  quantity: number;
  stock?: number;       // Made optional
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;    // Changed from getTotalPrice
  cartCount: number;    // Changed from getTotalItems
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (item) => {
        const items = get().items;
        const existingItem = items.find(i => i.id === item.id);
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            )
          });
        } else {
          set({ items: [...items, { ...item, quantity: item.quantity || 1 }] });
        }
      },
      
      removeFromCart: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          items: get().items.map(i =>
            i.id === id ? { ...i, quantity } : i
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      get cartTotal() {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      get cartCount() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'gladius-cart-storage',
    }
  )
);