'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { DashboardCharts } from '../../components/DashboardCharts';
import { api } from '../../lib/api';
import {
  ShieldAlert,
  Coins,
  ShoppingBag,
  Users,
  Box,
  Trash2,
  Edit,
  Plus,
  X,
  PlusCircle,
  Tag,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

interface Stats {
  summary: {
    total_revenue: number;
    total_orders: number;
    total_users: number;
    total_products: number;
  };
  low_stock: any[];
  trends: any[];
  brands: any[];
  recent_orders: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab control
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'coupons'>('analytics');

  // Product CRUD states
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Unisex');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState(100);
  const [stock, setStock] = useState(10);
  const [imageUrl, setImageUrl] = useState('');

  // Coupon CRUD states
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0.1);
  const [couponExpiry, setCouponExpiry] = useState('');

  const fetchDashboardData = async () => {
    try {
      const statsResp = await api.get('/admin/stats');
      setStats(statsResp.data);

      const prodResp = await api.get('/products?size=100');
      setProducts(prodResp.data.items);

      const orderResp = await api.get('/orders/all');
      setOrders(orderResp.data);

      const couponResp = await api.get('/admin/coupons');
      setCoupons(couponResp.data);
    } catch (error) {
      console.error('Failed to load admin logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  // Product CRUD Operations
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      brand,
      category,
      description,
      notes,
      price: Number(price),
      stock: Number(stock),
      image_url: imageUrl || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600'
    };

    try {
      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setProductFormOpen(false);
      resetProductForm();
      fetchDashboardData();
    } catch (error) {
      alert('Product operation failed');
    }
  };

  const handleEditProduct = (prod: any) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setBrand(prod.brand);
    setCategory(prod.category);
    setDescription(prod.description);
    setNotes(prod.notes || '');
    setPrice(prod.price);
    setStock(prod.stock);
    setImageUrl(prod.image_url || '');
    setProductFormOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this fragrance?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setName('');
    setBrand('');
    setCategory('Unisex');
    setDescription('');
    setNotes('');
    setPrice(100);
    setStock(10);
    setImageUrl('');
  };

  // Order status updates
  const handleOrderStatusUpdate = async (orderId: number, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  // Coupon Operations
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expiryDate = couponExpiry ? new Date(couponExpiry).toISOString() : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    try {
      await api.post('/admin/coupons', {
        code: couponCode.toUpperCase().trim(),
        discount: Number(couponDiscount),
        expiry_date: expiryDate
      });
      setCouponFormOpen(false);
      setCouponCode('');
      setCouponDiscount(0.1);
      setCouponExpiry('');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to create coupon code');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Delete this coupon code?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to delete coupon code');
    }
  };

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-28 space-y-12">
        {/* Header */}
        <div className="border-b border-[#1F1F23] pb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>LUXEAURA SECURITY COMMAND</span>
            </span>
            <h1 className="serif-title text-3xl md:text-5xl font-bold text-white mt-0.5">Admin Control Panel</h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs text-[#AEAEB2] tracking-widest uppercase">
            COMPILING COMMAND PANEL METRICS...
          </div>
        ) : (
          <div className="space-y-12">
            {/* Stat Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs tracking-wider">
                <div className="glass-card p-6 rounded-xl flex items-center space-x-4">
                  <div className="w-10 h-10 rounded bg-[#D4AF37]/15 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="text-[#AEAEB2] uppercase font-bold text-[9px]">TOTAL REVENUE</span>
                    <p className="text-white text-xl font-bold mt-1">${stats.summary.total_revenue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center space-x-4">
                  <div className="w-10 h-10 rounded bg-[#D4AF37]/15 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="text-[#AEAEB2] uppercase font-bold text-[9px]">TOTAL ORDERS</span>
                    <p className="text-white text-xl font-bold mt-1">{stats.summary.total_orders}</p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center space-x-4">
                  <div className="w-10 h-10 rounded bg-[#D4AF37]/15 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="text-[#AEAEB2] uppercase font-bold text-[9px]">ACTIVE USERS</span>
                    <p className="text-white text-xl font-bold mt-1">{stats.summary.total_users}</p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl flex items-center space-x-4">
                  <div className="w-10 h-10 rounded bg-[#D4AF37]/15 flex items-center justify-center">
                    <Box className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="text-[#AEAEB2] uppercase font-bold text-[9px]">RETAILED STOCKS</span>
                    <p className="text-white text-xl font-bold mt-1">{stats.summary.total_products}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation tabs */}
            <div className="flex border-b border-[#1F1F23] text-xs font-bold tracking-widest text-[#AEAEB2]">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`pb-4 px-6 border-b-2 transition ${activeTab === 'analytics' ? 'border-[#D4AF37] text-white' : 'border-transparent hover:text-white'}`}
              >
                ANALYTICS TRENDS
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-4 px-6 border-b-2 transition ${activeTab === 'products' ? 'border-[#D4AF37] text-white' : 'border-transparent hover:text-white'}`}
              >
                PRODUCTS CRUD
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-4 px-6 border-b-2 transition ${activeTab === 'orders' ? 'border-[#D4AF37] text-white' : 'border-transparent hover:text-white'}`}
              >
                ORDERS STATUS
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`pb-4 px-6 border-b-2 transition ${activeTab === 'coupons' ? 'border-[#D4AF37] text-white' : 'border-transparent hover:text-white'}`}
              >
                VOUCHERS
              </button>
            </div>

            {/* TAB CONTENTS */}

            {/* 1. Analytics & Trends */}
            {activeTab === 'analytics' && stats && (
              <div className="space-y-8 animate-fadeIn">
                <DashboardCharts trends={stats.trends} brands={stats.brands} />

                {/* Warnings / Low Stock card */}
                {stats.low_stock.length > 0 && (
                  <div className="glass-card p-6 rounded-xl border-l-4 border-yellow-500">
                    <h4 className="serif-title text-base font-bold text-white mb-4 flex items-center space-x-2">
                      <span>Inventory Low Stock Alert</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                      {stats.low_stock.map((item) => (
                        <div key={item.id} className="bg-black/30 p-4 border border-[#1F1F23] rounded">
                          <span className="text-[10px] text-[#D4AF37] uppercase">{item.brand}</span>
                          <p className="text-white mt-1">{item.name}</p>
                          <p className="text-red-500 font-bold mt-2">Only {item.stock} left in stock!</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Product Management */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="serif-title text-xl font-bold text-white">Manage Perfumes</h3>
                  <button
                    onClick={() => {
                      resetProductForm();
                      setProductFormOpen(true);
                    }}
                    className="bg-[#D4AF37] text-black px-4 py-2.5 rounded text-xs font-bold tracking-widest uppercase flex items-center space-x-1.5 hover:bg-[#E5C158]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>ADD PRODUCT</span>
                  </button>
                </div>

                {/* Table */}
                <div className="glass-card rounded-xl overflow-x-auto p-4">
                  <table className="w-full text-xs text-left tracking-wider">
                    <thead>
                      <tr className="border-b border-[#1F1F23] text-[#AEAEB2] font-semibold text-[10px] uppercase">
                        <th className="pb-3 pl-4">NAME</th>
                        <th className="pb-3">BRAND</th>
                        <th className="pb-3">CATEGORY</th>
                        <th className="pb-3">PRICE</th>
                        <th className="pb-3">STOCK</th>
                        <th className="pb-3 pr-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F23]">
                      {products.map((p) => (
                        <tr key={p.id} className="text-white">
                          <td className="py-3 pl-4 font-semibold">{p.name}</td>
                          <td className="py-3 text-[#AEAEB2]">{p.brand}</td>
                          <td className="py-3 text-[#AEAEB2]">{p.category}</td>
                          <td className="py-3 font-semibold">${p.price.toFixed(2)}</td>
                          <td className={`py-3 font-bold ${p.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>{p.stock}</td>
                          <td className="py-3 text-right pr-4 space-x-2">
                            <button onClick={() => handleEditProduct(p)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-[#FF453A] hover:bg-[#FF453A]/10 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Orders Management */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="serif-title text-xl font-bold text-white">Order Statuses</h3>
                <div className="glass-card rounded-xl overflow-x-auto p-4">
                  <table className="w-full text-xs text-left tracking-wider">
                    <thead>
                      <tr className="border-b border-[#1F1F23] text-[#AEAEB2] font-semibold text-[10px] uppercase">
                        <th className="pb-3 pl-4">ID</th>
                        <th className="pb-3">CUSTOMER ID</th>
                        <th className="pb-3">ADDRESS</th>
                        <th className="pb-3">TOTAL</th>
                        <th className="pb-3">CURRENT STATUS</th>
                        <th className="pb-3 pr-4 text-right">SET STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F23]">
                      {orders.map((o) => (
                        <tr key={o.id} className="text-white">
                          <td className="py-3.5 pl-4 font-bold text-[#D4AF37]">#{o.id}</td>
                          <td className="py-3.5 text-[#AEAEB2]">User #{o.user_id}</td>
                          <td className="py-3.5 truncate max-w-xs text-[#AEAEB2]">{o.shipping_address}</td>
                          <td className="py-3.5 font-semibold">${o.total_price.toFixed(2)}</td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${o.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : o.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right pr-4">
                            <select
                              value={o.status}
                              onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                              className="bg-black border border-[#1F1F23] text-[11px] text-white rounded p-1"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Voucher Management */}
            {activeTab === 'coupons' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="serif-title text-xl font-bold text-white">Active Promo Coupons</h3>
                  <button
                    onClick={() => setCouponFormOpen(true)}
                    className="bg-[#D4AF37] text-black px-4 py-2.5 rounded text-xs font-bold tracking-widest uppercase flex items-center space-x-1.5 hover:bg-[#E5C158]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>CREATE COUPON</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {coupons.map((c) => (
                    <div key={c.id} className="glass-card p-5 rounded-xl border border-[#D4AF37]/20 flex justify-between items-center">
                      <div className="space-y-1.5 text-xs font-medium tracking-wide">
                        <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded tracking-widest">{c.code}</span>
                        <p className="text-white font-bold text-base mt-2">{c.discount * 100}% Discount</p>
                        <p className="text-[#AEAEB2] text-[10px]">Expires: {new Date(c.expiry_date).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleDeleteCoupon(c.id)} className="text-[#FF453A] p-2 hover:bg-[#FF453A]/10 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Modal Form Overlay */}
      {productFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card p-8 rounded-2xl relative space-y-6 max-h-[90vh] overflow-y-auto font-sans">
            <button onClick={() => setProductFormOpen(false)} className="absolute top-4 right-4 text-[#AEAEB2] hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h3 className="serif-title text-2xl font-bold text-white border-b border-[#1F1F23] pb-3">
              {editingProductId ? 'Edit Fragrance' : 'Create Fragrance'}
            </h3>
            
            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-semibold tracking-wider text-[#AEAEB2]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label>PRODUCT NAME</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/60 border border-[#1F1F23] rounded p-2.5 text-white" />
                </div>
                <div className="space-y-1.5">
                  <label>BRAND</label>
                  <input type="text" required value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-black/60 border border-[#1F1F23] rounded p-2.5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label>CATEGORY</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/60 border border-[#1F1F23] rounded p-2.5 text-white">
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Luxury Collection">Luxury Collection</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label>IMAGE URL</label>
                  <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-black/60 border border-[#1F1F23] rounded p-2.5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label>PRICE ($)</label>
                  <input type="number" required value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-black/60 border border-[#1F1F23] rounded p-2.5 text-white" />
                </div>
                <div className="space-y-1.5">
                  <label>STOCK COUNT</label>
                  <input type="number" required value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full bg-black/60 border border-[#1F1F23] rounded p-2.5 text-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label>OLFACTORY PROFILE NOTES (Comma Separated)</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Bergamot, Patchouli, Sandalwood" className="w-full bg-black/60 border border-[#1F1F23] rounded p-2.5 text-white" />
              </div>

              <div className="space-y-1.5">
                <label>DESCRIPTION</label>
                <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-black/60 border border-[#1F1F23] rounded p-3 text-white" />
              </div>

              <button type="submit" className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold rounded text-xs tracking-widest uppercase transition mt-4">
                SUBMIT PRODUCT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal Form Overlay */}
      {couponFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-card p-8 rounded-2xl relative space-y-6 font-sans">
            <button onClick={() => setCouponFormOpen(false)} className="absolute top-4 right-4 text-[#AEAEB2] hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h3 className="serif-title text-xl font-bold text-white border-b border-[#1F1F23] pb-2">
              Create Coupon Code
            </h3>
            
            <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs font-semibold tracking-wider text-[#AEAEB2]">
              <div className="space-y-1.5">
                <label>CODE (e.g. FESTIVE30)</label>
                <input type="text" required value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="w-full bg-black/60 border border-[#1F1F23] rounded p-2.5 text-white" />
              </div>
              <div className="space-y-1.5">
                <label>DISCOUNT (e.g. 0.20 for 20% off)</label>
                <input type="number" step="0.01" min="0.01" max="1" required value={couponDiscount} onChange={(e) => setCouponDiscount(Number(e.target.value))} className="w-full bg-black/60 border border-[#1F1F23] rounded p-2.5 text-white" />
              </div>
              <div className="space-y-1.5">
                <label>EXPIRY DATE</label>
                <input type="date" value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} className="w-full bg-black/60 border border-[#1F1F23] rounded p-2.5 text-white" />
              </div>
              <button type="submit" className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold rounded text-xs tracking-widest uppercase transition mt-2">
                SUBMIT COUPON
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
