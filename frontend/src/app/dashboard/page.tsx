'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { User, ShoppingBag, Heart, ShieldAlert, CheckCircle, Mail, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import Link from 'next/link';

interface Order {
  id: number;
  total_price: number;
  payment_method: string;
  shipping_address: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit fields
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Address card state
  const [addressInput, setAddressInput] = useState('123 Luxury Ave, Beverly Hills, CA 90210');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    async function fetchOrders() {
      try {
        const response = await api.get('/orders/history');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to load user orders', error);
      } finally {
        setLoadingOrders(false);
      }
    }

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.put('/users/profile', {
        name: profileName,
        email: profileEmail
      });
      useAuthStore.getState().updateUser({ name: profileName, email: profileEmail });
      setSuccessMsg('Profile details updated successfully');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-28 space-y-12">
        {/* Welcome */}
        <div className="border-b border-[#1F1F23] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">MEMBERS AREA</span>
            <h1 className="serif-title text-3xl md:text-5xl font-bold text-white mt-1">Hello, {user?.name}</h1>
          </div>
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="bg-[#E5C158]/10 border border-[#E5C158]/35 text-[#E5C158] px-5 py-2.5 rounded text-xs font-semibold tracking-widest uppercase hover:bg-[#E5C158]/20 transition flex items-center space-x-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>LAUNCH ADMIN PORTAL</span>
            </Link>
          )}
        </div>

        {/* Dashboard Sections grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile & Settings (Left Span 1) */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl space-y-6">
              <h3 className="serif-title text-lg font-bold text-white border-b border-[#1F1F23] pb-3 tracking-wider flex items-center space-x-2">
                <User className="w-5 h-5 text-[#D4AF37]" />
                <span>Account Profile</span>
              </h3>

              <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs font-semibold tracking-wider text-[#AEAEB2]">
                {successMsg && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-3 rounded flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}
                {errorMsg && (
                  <div className="bg-[#FF453A]/10 border border-[#FF453A]/30 text-[#FF453A] p-3 rounded">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="p_name">FULL NAME</label>
                  <input
                    id="p_name"
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-black/60 border border-[#1F1F23] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="p_email">EMAIL ADDRESS</label>
                  <input
                    id="p_email"
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-black/60 border border-[#1F1F23] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold rounded text-xs tracking-widest uppercase transition disabled:opacity-50"
                >
                  {saving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
                </button>
              </form>
            </div>

            {/* Address Management card */}
            <div className="glass-card p-6 rounded-xl space-y-4">
              <h3 className="serif-title text-lg font-bold text-white border-b border-[#1F1F23] pb-3 tracking-wider flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <span>Primary Address</span>
              </h3>
              <textarea
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                rows={3}
                className="w-full bg-black/60 border border-[#1F1F23] rounded p-4 text-xs font-semibold tracking-wider text-white focus:outline-none focus:border-[#D4AF37] leading-relaxed"
              />
            </div>
          </div>

          {/* Billing Orders & Wishlists (Right Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Orders History */}
            <div className="glass-card p-6 rounded-xl space-y-4">
              <h3 className="serif-title text-lg font-bold text-white border-b border-[#1F1F23] pb-3 tracking-wider flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <span>Order Invoices ({orders.length})</span>
              </h3>

              {loadingOrders ? (
                <div className="text-center py-6 text-xs text-[#AEAEB2] tracking-widest uppercase">LOADING LIST...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <p className="text-xs text-[#AEAEB2]">You haven't placed any order invoices yet.</p>
                  <Link href="/products" className="bg-[#D4AF37] text-black px-4 py-2 rounded text-[10px] tracking-widest font-semibold uppercase inline-block">
                    SHOP FRAGRANCES
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left tracking-wider">
                    <thead>
                      <tr className="border-b border-[#1F1F23] text-[#AEAEB2] font-semibold text-[10px] tracking-widest uppercase">
                        <th className="pb-3">ORDER ID</th>
                        <th className="pb-3">DATE</th>
                        <th className="pb-3">TOTAL</th>
                        <th className="pb-3">METHOD</th>
                        <th className="pb-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F23]">
                      {orders.map((o) => (
                        <tr key={o.id} className="text-white">
                          <td className="py-3.5 font-bold text-[#D4AF37]">#{o.id}</td>
                          <td className="py-3.5 text-[#AEAEB2]">{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="py-3.5 font-semibold">${o.total_price.toFixed(2)}</td>
                          <td className="py-3.5 text-[#AEAEB2]">{o.payment_method}</td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${o.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : o.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Wishlist grid */}
            <div className="glass-card p-6 rounded-xl space-y-6">
              <h3 className="serif-title text-lg font-bold text-white border-b border-[#1F1F23] pb-3 tracking-wider flex items-center space-x-2">
                <Heart className="w-5 h-5 text-[#D4AF37]" />
                <span>My Wishlist Bookmarks ({wishlistItems.length})</span>
              </h3>

              {wishlistItems.length === 0 ? (
                <p className="text-xs text-[#AEAEB2] text-center py-6">Your bookmark board is empty.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="bg-black/30 border border-[#1F1F23] rounded-lg p-3 flex space-x-4">
                      <div className="w-16 h-20 bg-black/40 rounded overflow-hidden flex-shrink-0">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between text-xs">
                        <div>
                          <span className="text-[9px] tracking-widest text-[#D4AF37] font-semibold block">{item.brand}</span>
                          <h4 className="text-white font-bold tracking-wide mt-0.5">{item.name}</h4>
                          <p className="text-white/60 font-semibold mt-1">${item.price.toFixed(2)}</p>
                        </div>
                        <Link href={`/products/${item.id}`} className="text-[10px] text-[#D4AF37] hover:underline font-bold mt-2 inline-block">
                          VIEW DETAILS
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
