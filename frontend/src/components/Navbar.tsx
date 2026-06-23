'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { ShoppingBag, User, Sparkles, Menu, X, ShieldAlert } from 'lucide-react';
import { CartDrawer } from './CartDrawer';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-[#D4AF37]/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="serif-title text-2xl font-semibold tracking-wider text-white hover:text-[#D4AF37] transition">
              LUXEAURA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium tracking-widest text-[#AEAEB2]">
            <Link href="/products" className="hover:text-white transition">
              COLLECTION
            </Link>
            <Link href="/ai-recommend" className="hover:text-white transition">
              SCENT QUIZ
            </Link>
            <Link href="/ai-memory-finder" className="flex items-center space-x-1.5 hover:text-[#D4AF37] text-white font-semibold transition">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>AI FRAGRANCE FINDER</span>
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link href="/admin" className="flex items-center space-x-1 text-[#E5C158] hover:text-[#D4AF37] transition">
                <ShieldAlert className="w-4 h-4" />
                <span>ADMIN</span>
              </Link>
            )}
          </nav>

          {/* Action icons */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link href="/dashboard" className="flex items-center space-x-2 text-sm hover:text-white transition text-[#AEAEB2]">
                  <User className="w-5 h-5" />
                  <span>{user?.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs tracking-widest uppercase border border-[#D4AF37]/20 px-3 py-1.5 rounded hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] text-[#D4AF37] transition"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-2 text-sm text-[#AEAEB2] hover:text-white transition">
                <User className="w-5 h-5" />
                <span>SIGN IN</span>
              </Link>
            )}

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white hover:text-[#D4AF37] transition focus:outline-none"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#D4AF37] text-black text-[10px] font-bold rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white hover:text-[#D4AF37] transition"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#D4AF37] text-black text-[10px] font-bold rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-[#D4AF37] transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-b border-[#D4AF37]/10 px-6 py-8 flex flex-col space-y-6 text-center text-base tracking-widest font-medium text-[#AEAEB2]">
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white transition">
              COLLECTION
            </Link>
            <Link href="/ai-recommend" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white transition">
              SCENT QUIZ
            </Link>
            <Link href="/ai-memory-finder" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center space-x-1.5 hover:text-[#D4AF37] text-[#D4AF37] transition">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>AI FRAGRANCE FINDER</span>
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-[#E5C158] hover:text-[#D4AF37] transition">
                ADMIN
              </Link>
            )}
            <hr className="border-[#D4AF37]/10 w-1/3 mx-auto" />
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white transition">
                  MY DASHBOARD
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-sm border border-[#D4AF37]/30 py-3 rounded text-[#D4AF37] uppercase tracking-widest"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-[#D4AF37] text-black py-3 rounded uppercase text-sm font-semibold tracking-widest"
              >
                SIGN IN
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
