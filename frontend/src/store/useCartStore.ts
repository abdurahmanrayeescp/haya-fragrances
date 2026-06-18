import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
}

interface Coupon {
  code: string;
  discount: number; // e.g. 0.20 for 20%
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  recentlyViewed: number[]; // Product IDs
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  trackViewedProduct: (id: number) => void;
  clearCart: () => void;
  
  // Computed values
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTax: () => number;
  getShipping: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => {
  const isClient = typeof window !== 'undefined';
  const savedCart = isClient ? localStorage.getItem('luxeaura_cart') : null;
  const savedViewed = isClient ? localStorage.getItem('luxeaura_viewed') : null;

  return {
    items: savedCart ? JSON.parse(savedCart) : [],
    coupon: null,
    recentlyViewed: savedViewed ? JSON.parse(savedViewed) : [],

    addItem: (item) => {
      set((state) => {
        const existing = state.items.find((i) => i.id === item.id);
        let updatedItems;
        if (existing) {
          updatedItems = state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: Math.min(i.stock, i.quantity + 1) } : i
          );
        } else {
          updatedItems = [...state.items, { ...item, quantity: 1 }];
        }
        if (isClient) {
          localStorage.setItem('luxeaura_cart', JSON.stringify(updatedItems));
        }
        return { items: updatedItems };
      });
    },

    removeItem: (id) => {
      set((state) => {
        const updatedItems = state.items.filter((i) => i.id !== id);
        if (isClient) {
          localStorage.setItem('luxeaura_cart', JSON.stringify(updatedItems));
        }
        return { items: updatedItems };
      });
    },

    updateQuantity: (id, quantity) => {
      set((state) => {
        const updatedItems = state.items.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, Math.min(i.stock, quantity)) } : i
        );
        if (isClient) {
          localStorage.setItem('luxeaura_cart', JSON.stringify(updatedItems));
        }
        return { items: updatedItems };
      });
    },

    applyCoupon: (code, discount) => {
      set({ coupon: { code, discount } });
    },

    removeCoupon: () => {
      set({ coupon: null });
    },

    trackViewedProduct: (id) => {
      set((state) => {
        const filtered = state.recentlyViewed.filter((vid) => vid !== id);
        const updated = [id, ...filtered].slice(0, 4); // Keep last 4 items
        if (isClient) {
          localStorage.setItem('luxeaura_viewed', JSON.stringify(updated));
        }
        return { recentlyViewed: updated };
      });
    },

    clearCart: () => {
      if (isClient) {
        localStorage.removeItem('luxeaura_cart');
      }
      set({ items: [], coupon: null });
    },

    getSubtotal: () => {
      return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },

    getDiscountAmount: () => {
      const subtotal = get().getSubtotal();
      const coupon = get().coupon;
      return coupon ? subtotal * coupon.discount : 0;
    },

    getTax: () => {
      const subtotal = get().getSubtotal();
      return subtotal * 0.08; // 8% sales tax
    },

    getShipping: () => {
      const subtotal = get().getSubtotal();
      if (subtotal === 0) return 0;
      return subtotal >= 150 ? 0 : 15; // Free shipping for orders above $150
    },

    getTotal: () => {
      const subtotal = get().getSubtotal();
      const discount = get().getDiscountAmount();
      const tax = get().getTax();
      const shipping = get().getShipping();
      return Math.max(0, subtotal - discount + tax + shipping);
    }
  };
});
