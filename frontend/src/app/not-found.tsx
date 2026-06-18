'use client';

import Link from 'next/link';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Compass, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-28 relative overflow-hidden">
        {/* Subtle gold visual flare background */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />

        <div className="space-y-6 max-w-md">
          <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase flex items-center justify-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>LOST SILLAGE</span>
          </span>
          <h1 className="serif-title text-6xl md:text-8xl font-bold text-white tracking-wider">404</h1>
          <h2 className="serif-title text-2xl font-semibold text-[#D4AF37]">Scent Not Found</h2>
          <p className="text-xs text-[#AEAEB2] leading-relaxed max-w-sm mx-auto">
            The private reserve fragrance archive you are attempting to access does not exist or has been retired by our perfumers.
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs tracking-widest uppercase rounded px-6 py-3.5 transition"
            >
              <Compass className="w-4 h-4" />
              <span>RETURN TO RESERVES</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
