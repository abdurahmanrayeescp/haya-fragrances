'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { CheckCircle2, ChevronRight, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, coupon, getSubtotal, getDiscountAmount, getTax, getShipping, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  // Address form inputs
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address || !city || !phone) {
      setError('Please fill in all required shipping fields');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const orderItemsPayload = items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      // Submit Order API
      const response = await api.post('/orders', {
        items: orderItemsPayload,
        payment_method: paymentMethod,
        shipping_address: `${address}, ${city}`,
        phone_number: phone,
        coupon_code: coupon ? coupon.code : undefined
      });

      setOrderConfirmed(response.data);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Payment or order processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 py-28">
          <div className="w-full max-w-xl glass-card p-8 md:p-10 rounded-2xl text-center space-y-6">
            <CheckCircle2 className="w-16 h-16 text-[#D4AF37] mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="serif-title text-3xl font-bold text-white">Order Confirmed!</h2>
              <p className="text-xs text-[#AEAEB2] tracking-wider">
                Thank you for your purchase. Your invoice details have been emailed.
              </p>
            </div>

            <div className="border border-[#D4AF37]/15 bg-black/40 rounded-xl p-5 text-left text-xs space-y-3 font-medium">
              <div className="flex justify-between border-b border-[#1F1F23] pb-2 text-[10px] text-[#AEAEB2] tracking-widest">
                <span>INVOICE DETAILS</span>
                <span className="text-[#D4AF37] font-bold">ORDER ID: #{orderConfirmed.id}</span>
              </div>
              <div className="flex justify-between text-[#AEAEB2]">
                <span>Recipient:</span>
                <span className="text-white">{name}</span>
              </div>
              <div className="flex justify-between text-[#AEAEB2]">
                <span>Shipping Address:</span>
                <span className="text-white text-right max-w-xs">{orderConfirmed.shipping_address}</span>
              </div>
              <div className="flex justify-between text-[#AEAEB2]">
                <span>Payment Method:</span>
                <span className="text-white">{orderConfirmed.payment_method}</span>
              </div>
              <div className="flex justify-between border-t border-[#1F1F23] pt-2 text-sm font-semibold tracking-widest text-white">
                <span>TOTAL CHARGED</span>
                <span className="text-[#D4AF37]">${orderConfirmed.total_price.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs tracking-widest uppercase rounded transition"
              >
                CONTINUE SHOPPING
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-white/20 hover:border-white text-white font-bold text-xs tracking-widest uppercase rounded transition"
              >
                MY ORDER HISTORY
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-28">
        <div className="border-b border-[#1F1F23] pb-6 mb-12">
          <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">SECURE SECURE CHECKOUT</span>
          <h1 className="serif-title text-3xl md:text-5xl font-bold text-white mt-1">Checkout</h1>
        </div>

        {items.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-[#AEAEB2] tracking-wide text-sm font-medium">Your bag is empty. Add fragrances before checking out.</p>
            <Link href="/products" className="bg-[#D4AF37] text-black px-6 py-3.5 rounded text-xs font-bold tracking-widest uppercase">
              SHOP COLLECTION
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left Column: Form (Span 3) */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-[#D4AF37] border-b border-[#1F1F23] pb-3">
                  <Truck className="w-5 h-5" />
                  <h3 className="serif-title text-lg font-bold text-white tracking-wider">Shipping Details</h3>
                </div>

                {error && (
                  <div className="bg-[#FF453A]/10 border border-[#FF453A]/30 text-[#FF453A] text-xs p-3 rounded tracking-wide text-center">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium tracking-wider text-[#AEAEB2]">
                  <div className="space-y-1.5">
                    <label htmlFor="c_name">RECIPIENT FULL NAME</label>
                    <input
                      id="c_name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sonia Laurent"
                      className="w-full bg-black/60 border border-[#1F1F23] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="c_email">EMAIL ADDRESS</label>
                    <input
                      id="c_email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sonia@luxeaura.com"
                      className="w-full bg-black/60 border border-[#1F1F23] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="c_address">STREET ADDRESS</label>
                    <input
                      id="c_address"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Apartment 4B, 100 Champs-Élysées"
                      className="w-full bg-black/60 border border-[#1F1F23] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="c_city">CITY & POSTAL CODE</label>
                    <input
                      id="c_city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Paris, 75008"
                      className="w-full bg-black/60 border border-[#1F1F23] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="c_phone">PHONE NUMBER</label>
                    <input
                      id="c_phone"
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+33 1 40 76 53 00"
                      className="w-full bg-black/60 border border-[#1F1F23] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods selector */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-[#D4AF37] border-b border-[#1F1F23] pb-3">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="serif-title text-lg font-bold text-white tracking-wider">Payment Method</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold tracking-widest">
                  <label className={`glass-card p-5 rounded-xl flex items-center justify-between cursor-pointer border ${paymentMethod === 'Card' ? 'border-[#D4AF37]' : 'border-[#1F1F23]'}`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        value="Card"
                        checked={paymentMethod === 'Card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-[#D4AF37]"
                      />
                      <span className="text-white">CREDIT / DEBIT CARD</span>
                    </div>
                    <span className="text-[10px] text-[#AEAEB2] tracking-normal font-medium">VISA / MC</span>
                  </label>

                  <label className={`glass-card p-5 rounded-xl flex items-center justify-between cursor-pointer border ${paymentMethod === 'Razorpay' ? 'border-[#D4AF37]' : 'border-[#1F1F23]'}`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        value="Razorpay"
                        checked={paymentMethod === 'Razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-[#D4AF37]"
                      />
                      <span className="text-white">RAZORPAY GATEWAY</span>
                    </div>
                    <span className="text-[10px] text-[#AEAEB2] tracking-normal font-medium">UPI / NetBanking</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold rounded text-xs tracking-widest uppercase transition pt-4.5 pb-4.5 shadow-lg shadow-[#D4AF37]/15 disabled:opacity-50"
              >
                {loading ? 'PROCESSING TRANSACTION...' : 'AUTHORIZE PAYMENT'}
              </button>
            </form>

            {/* Right Column: Order Summary (Span 2) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 rounded-xl space-y-6">
                <h3 className="serif-title text-lg font-bold text-white border-b border-[#1F1F23] pb-3 tracking-wider">
                  Summary
                </h3>

                {/* Items preview list */}
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-14 bg-black/40 border border-[#D4AF37]/10 rounded overflow-hidden flex-shrink-0">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold tracking-wide truncate max-w-[120px]">{item.name}</h4>
                          <p className="text-[#AEAEB2] text-[10px] mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <hr className="border-[#1F1F23]" />

                {/* Pricing values */}
                <div className="space-y-3 text-xs tracking-wider text-[#AEAEB2]">
                  <div className="flex justify-between">
                    <span>Cart Subtotal</span>
                    <span className="text-white">${getSubtotal().toFixed(2)}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-[#D4AF37]">
                      <span>Discount Coupon</span>
                      <span>-${getDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="text-white">${getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="text-white">
                      {getShipping() === 0 ? 'FREE' : `$${getShipping().toFixed(2)}`}
                    </span>
                  </div>
                  <hr className="border-[#1F1F23]" />
                  <div className="flex justify-between text-sm font-semibold tracking-widest text-white">
                    <span>ORDER TOTAL</span>
                    <span className="text-[#D4AF37]">${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
