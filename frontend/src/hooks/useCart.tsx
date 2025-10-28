import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (item) => {
        const items = get().items;
        const existingItem = items.find(i => i._id === item._id);
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i._id === item._id
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.stock) }
                : i
            )
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      
      removeFromCart: (id) => {
        set({ items: get().items.filter(i => i._id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          items: get().items.map(i =>
            i._id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'gladius-cart-storage', // localStorage key
    }
  )
);