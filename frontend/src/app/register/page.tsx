'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useTranslation } from '../../store/useI18nStore';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setError('');

    try {
      // 1. Register API
      await api.post('/auth/register', { name, email, password });
      
      // 2. Automatically log in after registration
      const loginResp = await api.post('/auth/login', { email, password });
      login(loginResp.data.access_token, loginResp.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-28 relative overflow-hidden">
        {/* Decorative gold backdrop highlights */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md glass-card p-8 md:p-10 rounded-2xl relative space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-1 bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-3 py-1 rounded-full text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>{t('navbar.register')}</span>
            </div>
            <h2 className="serif-title text-3xl font-bold tracking-wide text-white">{t('auth.registerTitle')}</h2>
            <p className="text-xs text-[#AEAEB2] tracking-wide font-medium">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {error && (
            <div className="bg-[#FF453A]/10 border border-[#FF453A]/30 text-[#FF453A] text-xs p-3 rounded tracking-wide text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium tracking-wider text-[#AEAEB2]">
            <div className="space-y-1.5">
              <label htmlFor="name">{t('auth.nameLabel').toUpperCase()}</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sonia Laurent"
                className="w-full bg-black/60 border border-[#1F1F23] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email">{t('auth.emailLabel').toUpperCase()}</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sonia@luxeaura.com"
                className="w-full bg-black/60 border border-[#1F1F23] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password">{t('auth.passwordLabel').toUpperCase()}</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/60 border border-[#1F1F23] rounded pl-4 pr-10 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#AEAEB2] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold rounded text-xs tracking-widest uppercase transition pt-3.5 pb-3.5 mt-6 shadow-lg shadow-[#D4AF37]/15 disabled:opacity-50"
            >
              {loading ? 'CREATING ACCOUNT...' : t('auth.registerButton').toUpperCase()}
            </button>
          </form>

          <div className="text-center pt-2 text-xs tracking-wider text-[#AEAEB2]">
            <span>{t('auth.hasAccount')} </span>
            <Link href="/login" className="text-[#D4AF37] font-semibold hover:underline">
              {t('auth.loginLink')}
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
