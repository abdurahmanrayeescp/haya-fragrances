import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../store/useCartStore';

describe('useCartStore tests', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should initially have an empty cart', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.coupon).toBeNull();
  });

  it('should add items to the cart', () => {
    const state = useCartStore.getState();
    state.addItem({
      id: 1,
      name: 'Lost Cherry',
      brand: 'Tom Ford',
      price: 395.0,
      image_url: 'test.jpg',
      stock: 10
    });

    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(1);
    expect(updatedState.items[0].quantity).toBe(1);
    expect(updatedState.items[0].name).toBe('Lost Cherry');
  });

  it('should increment quantities when adding existing products', () => {
    const state = useCartStore.getState();
    state.addItem({ id: 2, name: 'Santal 33', brand: 'Le Labo', price: 310, image_url: 'test.jpg', stock: 5 });
    state.addItem({ id: 2, name: 'Santal 33', brand: 'Le Labo', price: 310, image_url: 'test.jpg', stock: 5 });

    const updated = useCartStore.getState();
    expect(updated.items[0].quantity).toBe(2);
  });

  it('should calculate subtotals, tax, and shipping correctly', () => {
    const state = useCartStore.getState();
    state.addItem({ id: 3, name: 'Eros', brand: 'Versace', price: 100.0, image_url: 'test.jpg', stock: 10 });
    
    // Subtotal: 100.0
    // Tax 8%: 8.0
    // Shipping: 15.0 (since subtotal < 150)
    // Total: 123.0
    expect(state.getSubtotal()).toBe(100.0);
    expect(state.getTax()).toBe(8.0);
    expect(state.getShipping()).toBe(15.0);
    expect(state.getTotal()).toBe(123.0);
  });

  it('should apply coupons discount correctly', () => {
    const state = useCartStore.getState();
    state.addItem({ id: 4, name: 'N5', brand: 'Chanel', price: 200.0, image_url: 'test.jpg', stock: 10 });
    state.applyCoupon('WELCOME10', 0.10); // 10% off

    // Subtotal: 200
    // Discount: 20
    // Tax 8% (on subtotal 200): 16
    // Shipping: FREE (since subtotal 200 >= 150)
    // Total: 200 - 20 + 16 = 196
    expect(state.getSubtotal()).toBe(200.0);
    expect(state.getDiscountAmount()).toBe(20.0);
    expect(state.getTotal()).toBe(196.0);
  });
});
