'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '../../store/useCartStore';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Trash2, Plus, Minus, CreditCard, Sparkles, ShoppingBag } from 'lucide-react';
import { api } from '../../lib/api';

export default function CartPage() {
  const {
    items,
    coupon,
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

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
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
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-28 space-y-8">
        <div className="border-b border-[#1F1F23] pb-6">
          <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">YOUR ORDER</span>
          <h1 className="serif-title text-3xl md:text-5xl font-bold text-white mt-1">Shopping Bag</h1>
        </div>

        {items.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center space-y-6">
            <ShoppingBag className="w-16 h-16 text-[#AEAEB2]" />
            <p className="text-[#AEAEB2] tracking-wide font-medium">Your shopping bag is currently empty.</p>
            <Link
              href="/products"
              className="bg-[#D4AF37] text-black px-8 py-3.5 rounded text-xs tracking-widest uppercase font-bold hover:bg-[#E5C158] transition"
            >
              SHOP FRAGRANCES
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="glass-card p-6 rounded-xl flex space-x-6 border-b border-[#1F1F23]">
                  {/* Image */}
                  <div className="w-24 h-32 bg-black/40 border border-[#D4AF37]/10 rounded overflow-hidden flex-shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-semibold">{item.brand}</span>
                        <h3 className="text-white text-base font-bold tracking-wide mt-0.5">{item.name}</h3>
                      </div>
                      <span className="text-white font-bold tracking-wide">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-[#1F1F23] rounded bg-black/30">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1.5 text-[#AEAEB2] hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-xs text-white font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1.5 text-[#AEAEB2] hover:text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#AEAEB2] hover:text-[#FF453A] flex items-center space-x-1 text-xs tracking-wider transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>REMOVE</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary */}
            <div className="glass-card p-8 rounded-xl h-fit space-y-6">
              <h3 className="serif-title text-xl font-bold text-white tracking-wider border-b border-[#1F1F23] pb-4">
                Order Summary
              </h3>

              {/* Coupon inputs */}
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <input
                  type="text"
                  placeholder={coupon ? `Coupon: ${coupon.code}` : "Promo Code (e.g. SUMMER20)"}
                  value={couponInput}
                  disabled={!!coupon}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-black/60 border border-[#1F1F23] px-3.5 py-2.5 text-xs rounded text-white focus:outline-none focus:border-[#D4AF37]"
                />
                {coupon ? (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="bg-[#FF453A]/10 border border-[#FF453A]/30 text-[#FF453A] px-4 py-2.5 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#FF453A]/25 transition"
                  >
                    REMOVE
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-[#D4AF37] text-black px-5 py-2.5 rounded text-xs uppercase tracking-widest font-bold hover:bg-[#E5C158] transition"
                  >
                    APPLY
                  </button>
                )}
              </form>
              {couponError && <p className="text-red-500 text-[11px] mt-1">{couponError}</p>}
              {coupon && (
                <p className="text-[#D4AF37] text-[11px] flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>Promo code {coupon.code} active ({coupon.discount * 100}% off).</span>
                </p>
              )}

              {/* pricing */}
              <div className="space-y-3.5 text-xs tracking-wider text-[#AEAEB2]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-white">${getSubtotal().toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-[#D4AF37]">
                    <span>Discount Coupon ({coupon.discount * 100}%)</span>
                    <span>-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Sales Tax (8%)</span>
                  <span className="text-white">${getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Handling</span>
                  <span className="text-white">
                    {getShipping() === 0 ? 'FREE' : `$${getShipping().toFixed(2)}`}
                  </span>
                </div>
                <hr className="border-[#1F1F23] my-4" />
                <div className="flex justify-between text-sm font-semibold tracking-widest text-white">
                  <span>TOTAL ESTIMATED</span>
                  <span className="text-[#D4AF37]">${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold rounded text-xs tracking-widest text-center flex items-center justify-center space-x-2 transition uppercase"
              >
                <CreditCard className="w-4 h-4" />
                <span>PROCEED TO CHECKOUT</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
