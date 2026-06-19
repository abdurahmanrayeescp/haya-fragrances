'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/adminApi';
import { Users, Search, ShieldCheck, User as UserIcon } from 'lucide-react';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    adminApi
      .get('/admin/users')
      .then((r) => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount  = users.filter((u) => u.role === 'user').length;

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="border-b border-[#1F1F23] pb-6">
        <p className="text-[10px] tracking-[0.22em] text-[#D4AF37] font-bold uppercase">Management</p>
        <h1 className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Users
        </h1>
      </div>

      {/* Summary pills */}
      <div className="flex gap-4">
        <div className="flex items-center space-x-2 bg-[#111113] border border-[#1F1F23] rounded-lg px-4 py-2.5">
          <Users className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs text-white font-semibold">{users.length} Total</span>
        </div>
        <div className="flex items-center space-x-2 bg-[#111113] border border-[#1F1F23] rounded-lg px-4 py-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-white font-semibold">{adminCount} Admins</span>
        </div>
        <div className="flex items-center space-x-2 bg-[#111113] border border-[#1F1F23] rounded-lg px-4 py-2.5">
          <UserIcon className="w-4 h-4 text-green-400" />
          <span className="text-xs text-white font-semibold">{userCount} Customers</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A3A3C]" />
        <input
          type="text"
          placeholder="Search by name or email…"
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
            <Users className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1F1F23] text-[#AEAEB2] font-bold tracking-widest uppercase text-[10px]">
                  <th className="text-left px-5 py-4">ID</th>
                  <th className="text-left py-4">Name</th>
                  <th className="text-left py-4">Email</th>
                  <th className="text-left py-4">Role</th>
                  <th className="text-left py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {filtered.map((u) => (
                  <tr key={u.id} className="text-white hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-[#AEAEB2] font-mono">#{u.id}</td>
                    <td className="py-3.5 font-semibold">{u.name}</td>
                    <td className="py-3.5 text-[#AEAEB2]">{u.email}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded ${
                          u.role === 'admin'
                            ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}
                      >
                        {u.role === 'admin'
                          ? <><ShieldCheck className="w-3 h-3" /><span>Admin</span></>
                          : <><UserIcon className="w-3 h-3" /><span>Customer</span></>
                        }
                      </span>
                    </td>
                    <td className="py-3.5 text-[#AEAEB2]">
                      {new Date(u.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
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
