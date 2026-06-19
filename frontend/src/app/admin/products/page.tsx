'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/adminApi';
import { Plus, Edit, Trash2, X, Search, Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  description: string;
  notes: string;
}

const EMPTY_FORM = {
  name: '', brand: '', category: 'Unisex', description: '',
  notes: '', price: 100, stock: 10, image_url: '',
};

const INPUT_CLS =
  'w-full bg-[#0B0B0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all placeholder-[#3A3A3C]';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingId,     setEditingId]     = useState<number | null>(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState('');

  const fetchProducts = async () => {
    try {
      const r = await adminApi.get('/products?size=100');
      setProducts(r.data.items ?? r.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, brand: p.brand, category: p.category,
      description: p.description, notes: p.notes ?? '',
      price: p.price, stock: p.stock, image_url: p.image_url ?? '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url:
        form.image_url ||
        'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
    };
    try {
      if (editingId) {
        await adminApi.put(`/products/${editingId}`, payload);
      } else {
        await adminApi.post('/products', payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message ?? 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete product');
    }
  };

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="border-b border-[#1F1F23] pb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-[#D4AF37] font-bold uppercase">Management</p>
          <h1 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Products
          </h1>
        </div>
        <button
          id="add-product-btn"
          onClick={openAdd}
          className="flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs tracking-widest uppercase px-5 py-2.5 rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A3A3C]" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111113] border border-[#1F1F23] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder-[#3A3A3C]"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#8E8E93]">
            <Package className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1F1F23] text-[#AEAEB2] font-bold tracking-widest uppercase text-[10px]">
                  <th className="text-left px-5 py-4">Name</th>
                  <th className="text-left py-4">Brand</th>
                  <th className="text-left py-4">Category</th>
                  <th className="text-left py-4">Price</th>
                  <th className="text-left py-4">Stock</th>
                  <th className="text-right px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {filtered.map((p) => (
                  <tr key={p.id} className="text-white hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-semibold">{p.name}</td>
                    <td className="py-3.5 text-[#AEAEB2]">{p.brand}</td>
                    <td className="py-3.5 text-[#AEAEB2]">{p.category}</td>
                    <td className="py-3.5 font-semibold">${p.price.toFixed(2)}</td>
                    <td className="py-3.5">
                      <span className={`font-bold ${p.stock < 5 ? 'text-red-400' : 'text-green-400'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3.5 text-right px-5 space-x-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                        aria-label="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111113] border border-[#D4AF37]/20 rounded-2xl p-7 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#8E8E93] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              {editingId ? 'Edit Fragrance' : 'Add Fragrance'}
            </h2>

            {error && (
              <div className="mb-4 bg-[#FF453A]/10 border border-[#FF453A]/30 rounded-lg px-4 py-2.5">
                <p className="text-[#FF453A] text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Name *</label>
                  <input required className={INPUT_CLS} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Brand *</label>
                  <input required className={INPUT_CLS} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Category</label>
                  <select className={INPUT_CLS} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option>Men</option>
                    <option>Women</option>
                    <option>Unisex</option>
                    <option>Luxury Collection</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Image URL</label>
                  <input className={INPUT_CLS} placeholder="https://…" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Price ($) *</label>
                  <input required type="number" min={0} step={0.01} className={INPUT_CLS} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Stock *</label>
                  <input required type="number" min={0} className={INPUT_CLS} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Notes (comma separated)</label>
                <input className={INPUT_CLS} placeholder="Bergamot, Patchouli…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Description *</label>
                <textarea required rows={3} className={INPUT_CLS + ' resize-none'} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:from-[#E5C158] hover:to-[#C49221] disabled:opacity-50 text-black font-bold text-xs tracking-widest uppercase rounded-lg transition-all duration-200 mt-2"
              >
                {submitting ? 'Saving…' : editingId ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
