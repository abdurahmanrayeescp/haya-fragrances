'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '../store/useCartStore';
import { X, Trash2, Plus, Minus, CreditCard, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    items,
    coupon,
    addItem,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getTax,
    getShipping,
    getTotal
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      // Apply coupon call
      const response = await api.post('/coupons/apply', { code: couponInput.trim() });
      if (response.data.valid) {
        applyCoupon(response.data.code, response.data.discount);
        setCouponInput('');
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid or expired coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Overlay backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Panel wrapper */}
        <div className="w-screen max-w-md bg-[#121214] border-l border-[#D4AF37]/10 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-6 border-b border-[#D4AF37]/10 flex items-center justify-between">
            <h2 className="serif-title text-xl font-bold tracking-wider text-white">SHOPPING BAG</h2>
            <button onClick={onClose} className="text-[#AEAEB2] hover:text-white transition focus:outline-none">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-[#AEAEB2] tracking-wide">Your fragrance bag is empty</p>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="bg-[#D4AF37] text-black px-6 py-3 rounded text-xs tracking-widest uppercase font-semibold hover:bg-[#E5C158] transition"
                >
                  SHOP COLLECTION
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex space-x-4 border-b border-[#1F1F23] pb-6">
                  {/* Image */}
                  <div className="w-20 h-24 bg-black/40 border border-[#D4AF37]/15 rounded overflow-hidden flex-shrink-0 relative">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-semibold">{item.brand}</span>
                      <h4 className="text-white text-sm font-semibold tracking-wide truncate">{item.name}</h4>
                      <p className="text-[#D4AF37] text-xs font-semibold mt-1">${item.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#1F1F23] rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-[#AEAEB2] hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-[#AEAEB2] hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#AEAEB2] hover:text-[#FF453A] transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout pricing panel */}
          {items.length > 0 && (
            <div className="border-t border-[#D4AF37]/10 bg-black/40 px-6 py-6 space-y-6">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <input
                  type="text"
                  placeholder={coupon ? `Active: ${coupon.code}` : "Coupon Code (e.g. WELCOME10)"}
                  value={couponInput}
                  disabled={!!coupon}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-black/80 border border-[#1F1F23] px-3 py-2 text-xs rounded text-white focus:outline-none focus:border-[#D4AF37] disabled:opacity-60"
                />
                {coupon ? (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="bg-[#FF453A]/20 border border-[#FF453A]/30 text-[#FF453A] px-3 py-2 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#FF453A]/35 transition"
                  >
                    REMOVE
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-[#D4AF37] text-black px-4 py-2 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#E5C158] transition disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'APPLY'}
                  </button>
                )}
              </form>
              {couponError && <p className="text-red-500 text-[11px] mt-1">{couponError}</p>}
              {coupon && (
                <p className="text-[#D4AF37] text-[11px] mt-1 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Coupon {coupon.code} applied successfully!</span>
                </p>
              )}

              {/* Pricing breakdown */}
              <div className="space-y-2 text-xs tracking-wider text-[#AEAEB2]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">${getSubtotal().toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-[#D4AF37]">
                    <span>Discount ({coupon.discount * 100}%)</span>
                    <span>-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Sales Tax (8%)</span>
                  <span className="text-white">${getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white">
                    {getShipping() === 0 ? 'FREE' : `$${getShipping().toFixed(2)}`}
                  </span>
                </div>
                <hr className="border-[#1F1F23] my-2" />
                <div className="flex justify-between text-sm font-semibold tracking-widest text-white">
                  <span>TOTAL</span>
                  <span className="text-[#D4AF37]">${getTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Action checkout button */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold rounded text-xs tracking-widest text-center flex items-center justify-center space-x-2 transition uppercase"
              >
                <CreditCard className="w-4 h-4" />
                <span>PROCEED TO CHECKOUT</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
