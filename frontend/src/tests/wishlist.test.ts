import { describe, it, expect, beforeEach } from 'vitest';
import { useWishlistStore } from '../store/useWishlistStore';

describe('useWishlistStore tests', () => {
  beforeEach(() => {
    useWishlistStore.getState().setItems([]);
  });

  it('should initially have an empty wishlist', () => {
    const state = useWishlistStore.getState();
    expect(state.items).toEqual([]);
  });

  it('should add bookmarks to the wishlist board', () => {
    const state = useWishlistStore.getState();
    state.addItem({
      id: 1,
      name: 'Lost Cherry',
      brand: 'Tom Ford',
      price: 395.0,
      image_url: 'test.jpg',
      rating: 4.8
    });

    const updated = useWishlistStore.getState();
    expect(updated.items.length).toBe(1);
    expect(updated.hasItem(1)).toBe(true);
  });

  it('should prevent adding duplicate bookmarks', () => {
    const state = useWishlistStore.getState();
    const item = { id: 2, name: 'Santal 33', brand: 'Le Labo', price: 310, image_url: 'test.jpg', rating: 4.6 };
    state.addItem(item);
    state.addItem(item);

    const updated = useWishlistStore.getState();
    expect(updated.items.length).toBe(1);
  });

  it('should delete bookmarks from the wishlist board', () => {
    const state = useWishlistStore.getState();
    state.addItem({ id: 3, name: 'Eros', brand: 'Versace', price: 100, image_url: 'test.jpg', rating: 4.4 });
    expect(state.hasItem(3)).toBe(true);

    state.removeItem(3);
    const updated = useWishlistStore.getState();
    expect(updated.hasItem(3)).toBe(false);
    expect(updated.items.length).toBe(0);
  });
});
