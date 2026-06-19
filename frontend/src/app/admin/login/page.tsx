'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';
import { adminApi } from '../../../lib/adminApi';

/**
 * /admin/login — Standalone luxury admin login page.
 * Calls POST /api/admin/login (which verifies role == "admin").
 * On success, saves to useAdminStore and redirects to /admin.
 * Has NO connection to the customer useAuthStore.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, isAdminAuthenticated } = useAdminStore();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [mounted,      setMounted]      = useState(false);

  useEffect(() => setMounted(true), []);

  // Already authenticated → skip login
  useEffect(() => {
    if (mounted && isAdminAuthenticated) {
      router.replace('/admin');
    }
  }, [mounted, isAdminAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminApi.post('/admin/login', { email, password });
      adminLogin(res.data.access_token, res.data.user);
      router.replace('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center relative overflow-hidden px-4">

      {/* ── Ambient glows ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#D4AF37]/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#AA7C11]/4 rounded-full blur-[100px]" />
      </div>

      {/* ── Subtle grid ──────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">

        {/* ── Logo / brand ──────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#AA7C11]/10 border border-[#D4AF37]/30 mb-5 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
            <Shield className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <p className="text-[10px] tracking-[0.28em] text-[#D4AF37] font-bold uppercase mb-2">
            Haya Fragrances
          </p>
          <h1
            className="text-4xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Admin Portal
          </h1>
          <p className="text-[#8E8E93] text-sm mt-2">
            Restricted access — administrators only
          </p>
        </div>

        {/* ── Form card ─────────────────────────────────────────── */}
        <div className="relative bg-[#111113]/85 backdrop-blur-2xl border border-[#D4AF37]/20 rounded-2xl p-8 shadow-[0_30px_70px_rgba(0,0,0,0.55)]">
          {/* Gold top accent line */}
          <div className="absolute top-0 inset-x-0 flex justify-center">
            <div className="w-36 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="text-[10px] tracking-[0.18em] text-[#AEAEB2] font-bold uppercase"
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@haya.com"
                className="w-full bg-[#0B0B0B] border border-[#1F1F23] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all placeholder-[#3A3A3C]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="text-[10px] tracking-[0.18em] text-[#AEAEB2] font-bold uppercase"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0B0B] border border-[#1F1F23] rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all placeholder-[#3A3A3C]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A3A3C] hover:text-[#AEAEB2] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-[#FF453A]/10 border border-[#FF453A]/30 rounded-lg px-4 py-3">
                <p className="text-[#FF453A] text-xs font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:from-[#E5C158] hover:to-[#C49221] disabled:opacity-50 text-black font-bold text-xs tracking-[0.18em] uppercase rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 mt-2 shadow-[0_4px_20px_rgba(212,175,55,0.25)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <span>Access Control Panel</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#2C2C2E] text-xs mt-6">
          © {new Date().getFullYear()} Haya Fragrances. Authorised Personnel Only.
        </p>
      </div>
    </div>
  );
}
