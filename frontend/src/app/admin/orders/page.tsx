'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/adminApi';
import { ShoppingBag } from 'lucide-react';

interface Order {
  id: number;
  user_id: number;
  shipping_address: string;
  total_price: number;
  status: string;
  payment_method: string;
  created_at: string;
}

const STATUS_OPTIONS = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

const STATUS_BADGE: Record<string, string> = {
  Delivered:  'bg-green-500/10  text-green-400',
  Cancelled:  'bg-red-500/10    text-red-400',
  Processing: 'bg-blue-500/10   text-blue-400',
  Pending:    'bg-yellow-500/10 text-yellow-400',
};

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const r = await adminApi.get('/orders/all');
      setOrders(r.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await adminApi.patch(`/orders/${id}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
    } catch (err: any) {
      alert(err.message ?? 'Failed to update status');
    }
  };

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="border-b border-[#1F1F23] pb-6">
        <p className="text-[10px] tracking-[0.22em] text-[#D4AF37] font-bold uppercase">Management</p>
        <h1 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Orders
        </h1>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <div key={s} className={`px-4 py-2 rounded-lg text-xs font-bold ${STATUS_BADGE[s] ?? 'bg-white/5 text-white'}`}>
              {s}: {count}
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#8E8E93]">
            <ShoppingBag className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1F1F23] text-[#AEAEB2] font-bold tracking-widest uppercase text-[10px]">
                  <th className="text-left px-5 py-4">Order ID</th>
                  <th className="text-left py-4">Customer</th>
                  <th className="text-left py-4 hidden md:table-cell">Address</th>
                  <th className="text-left py-4">Total</th>
                  <th className="text-left py-4">Status</th>
                  <th className="text-right px-5 py-4">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {orders.map((o) => (
                  <tr key={o.id} className="text-white hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-[#D4AF37] font-bold">#{o.id}</span>
                    </td>
                    <td className="py-3.5 text-[#AEAEB2]">User #{o.user_id}</td>
                    <td className="py-3.5 text-[#AEAEB2] hidden md:table-cell max-w-[180px] truncate">
                      {o.shipping_address}
                    </td>
                    <td className="py-3.5 font-semibold">${o.total_price.toFixed(2)}</td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${STATUS_BADGE[o.status] ?? 'bg-white/5 text-white'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right px-5">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="bg-[#0B0B0B] border border-[#1F1F23] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
