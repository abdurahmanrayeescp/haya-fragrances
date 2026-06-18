import { create } from 'zustand';

interface WishlistItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  rating: number;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
  hasItem: (id: number) => boolean;
  setItems: (items: WishlistItem[]) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => {
  const isClient = typeof window !== 'undefined';
  const savedWishlist = isClient ? localStorage.getItem('luxeaura_wishlist') : null;

  return {
    items: savedWishlist ? JSON.parse(savedWishlist) : [],

    addItem: (item) => {
      set((state) => {
        const exists = state.items.some((i) => i.id === item.id);
        if (exists) return state;
        const updated = [...state.items, item];
        if (isClient) {
          localStorage.setItem('luxeaura_wishlist', JSON.stringify(updated));
        }
        return { items: updated };
      });
    },

    removeItem: (id) => {
      set((state) => {
        const updated = state.items.filter((i) => i.id !== id);
        if (isClient) {
          localStorage.setItem('luxeaura_wishlist', JSON.stringify(updated));
        }
        return { items: updated };
      });
    },

    hasItem: (id) => {
      return get().items.some((i) => i.id === id);
    },

    setItems: (items) => {
      if (isClient) {
        localStorage.setItem('luxeaura_wishlist', JSON.stringify(items));
      }
      set({ items });
    }
  };
});
