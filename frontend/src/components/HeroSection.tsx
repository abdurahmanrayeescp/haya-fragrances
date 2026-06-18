'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black font-sans">
      {/* Background visual asset image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-60 scale-105 transition-transform duration-10000"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1920')` 
        }} 
      />

      {/* Radial shade mask for deep contrast */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B0B0B] via-black/40 to-black/80" />

      {/* Glassmorphic card contents */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 bg-black/40 border border-[#D4AF37]/20 px-4 py-1.5 rounded-full text-xs tracking-widest text-[#D4AF37] uppercase font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AWWWARDS WINNING FRAGRANCES</span>
        </div>

        <h1 className="serif-title text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Discover Luxury <br />
          <span className="gold-text-gradient">In Every Drop</span>
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-[#AEAEB2] font-medium tracking-wide leading-relaxed">
          Exclusive fragrances crafted for unforgettable experiences. Inspired by Dior, Tom Ford, Chanel, and Le Labo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/products"
            className="w-full sm:w-auto px-8 py-4 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs tracking-widest uppercase rounded flex items-center justify-center space-x-2 transition shadow-lg shadow-[#D4AF37]/15"
          >
            <span>SHOP COLLECTION</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ai-recommend"
            className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-white hover:bg-white/5 text-white font-bold text-xs tracking-widest uppercase rounded transition"
          >
            EXPLORE QUIZ
          </Link>
        </div>
      </div>

      {/* Floating perfume decorative particles */}
      <div className="absolute bottom-10 left-10 hidden lg:block animate-float opacity-30 z-20">
        <div className="glass-card p-4 rounded-xl flex items-center space-x-3 text-xs">
          <div className="w-8 h-8 rounded bg-[#D4AF37]/20 flex items-center justify-center font-bold text-[#D4AF37]">TF</div>
          <div>
            <p className="font-semibold text-white">Lost Cherry</p>
            <p className="text-[#AEAEB2] scale-90 origin-left">Tom Ford</p>
          </div>
        </div>
      </div>

      <div className="absolute top-24 right-12 hidden lg:block animate-float opacity-20 z-20" style={{ animationDelay: '2s' }}>
        <div className="glass-card p-4 rounded-xl flex items-center space-x-3 text-xs">
          <div className="w-8 h-8 rounded bg-[#D4AF37]/20 flex items-center justify-center font-bold text-[#D4AF37]">CH</div>
          <div>
            <p className="font-semibold text-white">No. 5</p>
            <p className="text-[#AEAEB2] scale-90 origin-left">Chanel</p>
          </div>
        </div>
      </div>
    </section>
  );
}
