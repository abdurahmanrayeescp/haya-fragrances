'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/adminApi';
import {
  Coins, ShoppingBag, Users, Package, TrendingUp, AlertTriangle,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

/* ─── types ──────────────────────────────────────────────────────────── */
interface Stats {
  summary: {
    total_revenue:  number;
    total_orders:   number;
    total_users:    number;
    total_products: number;
  };
  low_stock:     any[];
  trends:        any[];
  brands:        any[];
  recent_orders: any[];
}

const GOLD_PALETTE = ['#D4AF37', '#AA7C11', '#E5C158', '#F5E0A3', '#8B6914'];

const STAT_CARDS = (s: Stats['summary']) => [
  { label: 'Total Revenue',   value: `$${s.total_revenue.toFixed(2)}`, icon: Coins,       accent: '#D4AF37' },
  { label: 'Total Orders',    value: s.total_orders,                   icon: ShoppingBag, accent: '#6366F1' },
  { label: 'Total Users',     value: s.total_users,                    icon: Users,       accent: '#22C55E' },
  { label: 'Total Products',  value: s.total_products,                 icon: Package,     accent: '#EF4444' },
];

const tooltipStyle = {
  contentStyle: {
    background: '#111113',
    border: '1px solid #1F1F23',
    borderRadius: 10,
    color: '#F5F5F7',
    fontSize: 12,
  },
};

/* ─── component ──────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-[#AEAEB2] text-sm">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="border-b border-[#1F1F23] pb-6">
        <p className="text-[10px] tracking-[0.22em] text-[#D4AF37] font-bold uppercase">
          Control Panel
        </p>
        <h1
          className="text-3xl font-bold text-white mt-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Dashboard Overview
        </h1>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STAT_CARDS(stats.summary).map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="bg-[#111113] border border-[#1F1F23] hover:border-[#D4AF37]/30 rounded-xl p-5 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">
                {label}
              </span>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${accent}18` }}
              >
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            <span>Revenue Trend</span>
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={stats.trends}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F23" />
              <XAxis dataKey="month" tick={{ fill: '#8E8E93', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8E8E93', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#D4AF37"
                strokeWidth={2}
                fill="url(#revGrad)"
                dot={{ fill: '#D4AF37', r: 3 }}
                activeDot={{ r: 5, fill: '#E5C158' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Brand Distribution Pie */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-5">Brand Distribution</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={stats.brands}
                dataKey="count"
                nameKey="brand"
                cx="50%" cy="45%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                strokeWidth={0}
              >
                {stats.brands.map((_: any, i: number) => (
                  <Cell key={i} fill={GOLD_PALETTE[i % GOLD_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#8E8E93' }}
                iconSize={8}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Monthly Orders Bar Chart ───────────────────────────────── */}
      <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
        <h3 className="text-sm font-bold text-white mb-5">Monthly Orders</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.trends} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F23" />
            <XAxis dataKey="month" tick={{ fill: '#8E8E93', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8E8E93', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle} formatter={(v: any) => [v, 'Orders']} />
            <Bar dataKey="orders" fill="#D4AF37" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent Orders + Low Stock ──────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Recent Orders</h3>
          {stats.recent_orders.length === 0 ? (
            <p className="text-[#8E8E93] text-xs">No orders yet.</p>
          ) : (
            <div className="divide-y divide-[#1F1F23]">
              {stats.recent_orders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-[#D4AF37] text-xs font-bold">#{o.id}</span>
                    <span className="text-[#AEAEB2] text-xs ml-2">{o.customer}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-white text-xs font-semibold">
                      ${o.total_price.toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        o.status === 'Delivered'  ? 'bg-green-500/10 text-green-400'  :
                        o.status === 'Cancelled'  ? 'bg-red-500/10   text-red-400'    :
                                                    'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span>Low Stock Alerts</span>
          </h3>
          {stats.low_stock.length === 0 ? (
            <p className="text-[#8E8E93] text-xs">All products are well stocked. ✓</p>
          ) : (
            <div className="divide-y divide-[#1F1F23]">
              {stats.low_stock.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-white text-xs font-semibold">{p.name}</p>
                    <p className="text-[#AEAEB2] text-[10px]">{p.brand}</p>
                  </div>
                  <span className="text-red-400 text-xs font-bold">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
