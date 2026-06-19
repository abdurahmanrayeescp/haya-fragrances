'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/adminApi';
import { Plus, Trash2, X, Tag, Loader2 } from 'lucide-react';

interface Coupon {
  id: number;
  code: string;
  discount: number;
  expiry_date: string;
  is_active: boolean;
}

const INPUT_CLS =
  'w-full bg-[#0B0B0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all placeholder-[#3A3A3C]';

const EMPTY = { code: '', discount: '0.10', expiry: '' };

export default function AdminCouponsPage() {
  const [coupons,    setCoupons]    = useState<Coupon[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const fetchCoupons = async () => {
    try {
      const r = await adminApi.get('/admin/coupons');
      setCoupons(r.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const expiryDate = form.expiry
      ? new Date(form.expiry).toISOString()
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    try {
      await adminApi.post('/admin/coupons', {
        code:        form.code.toUpperCase().trim(),
        discount:    Number(form.discount),
        expiry_date: expiryDate,
        is_active:   true,
      });
      setModalOpen(false);
      setForm(EMPTY);
      fetchCoupons();
    } catch (err: any) {
      setError(err.message ?? 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await adminApi.delete(`/admin/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete coupon');
    }
  };

  const isExpired = (dateStr: string) =>
    new Date(dateStr) < new Date();

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="border-b border-[#1F1F23] pb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-[#D4AF37] font-bold uppercase">Management</p>
          <h1 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Coupons
          </h1>
        </div>
        <button
          id="create-coupon-btn"
          onClick={() => { setForm(EMPTY); setError(''); setModalOpen(true); }}
          className="flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs tracking-widest uppercase px-5 py-2.5 rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-[#8E8E93] bg-[#111113] border border-[#1F1F23] rounded-xl">
          <Tag className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">No coupons yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {coupons.map((c) => {
            const expired = isExpired(c.expiry_date);
            return (
              <div
                key={c.id}
                className={`bg-[#111113] border rounded-xl p-5 flex items-start justify-between transition-all duration-200 ${
                  expired
                    ? 'border-[#1F1F23] opacity-60'
                    : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                }`}
              >
                <div className="space-y-2">
                  {/* Code badge */}
                  <div className="inline-flex items-center space-x-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-md px-2.5 py-1">
                    <Tag className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[#D4AF37] text-[11px] font-bold tracking-widest">{c.code}</span>
                  </div>

                  <p className="text-2xl font-bold text-white">
                    {(c.discount * 100).toFixed(0)}%
                    <span className="text-sm font-normal text-[#AEAEB2] ml-1">off</span>
                  </p>

                  <p className={`text-[11px] font-medium ${expired ? 'text-red-400' : 'text-[#AEAEB2]'}`}>
                    {expired ? '⚠ Expired' : 'Expires'}:{' '}
                    {new Date(c.expiry_date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>

                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${
                    c.is_active && !expired
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {c.is_active && !expired ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(c.id, c.code)}
                  className="text-[#FF453A]/60 hover:text-[#FF453A] hover:bg-[#FF453A]/10 p-2 rounded-lg transition-all duration-200 ml-3 flex-shrink-0"
                  aria-label="Delete coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Modal ──────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#111113] border border-[#D4AF37]/20 rounded-2xl p-7 relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#8E8E93] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Create Coupon
            </h2>

            {error && (
              <div className="mb-4 bg-[#FF453A]/10 border border-[#FF453A]/30 rounded-lg px-4 py-2.5">
                <p className="text-[#FF453A] text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">
                  Code (e.g. WELCOME20)
                </label>
                <input
                  required
                  className={INPUT_CLS}
                  placeholder="SUMMER30"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">
                  Discount (e.g. 0.20 = 20% off)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1"
                  className={INPUT_CLS}
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  className={INPUT_CLS}
                  value={form.expiry}
                  onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:from-[#E5C158] hover:to-[#C49221] disabled:opacity-50 text-black font-bold text-xs tracking-widest uppercase rounded-lg transition-all duration-200 mt-2 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating…</span></>
                ) : (
                  <span>Create Coupon</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
