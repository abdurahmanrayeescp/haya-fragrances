'use client';

import { useState } from 'react';
import { Mail, Sparkles } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div className="py-24 bg-gradient-to-b from-[#0B0B0B] to-[#121214] font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <div className="glass-card rounded-2xl p-10 md:p-16 text-center space-y-6 relative overflow-hidden">
          {/* Subtle gold backlighting */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />

          <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-4.5 py-1 rounded-full text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>JOIN THE CLUB</span>
          </div>

          <h2 className="serif-title text-3xl md:text-5xl font-bold text-white tracking-tight">
            Unlock Olfactory Excellence
          </h2>

          <p className="max-w-lg mx-auto text-xs md:text-sm text-[#AEAEB2] leading-relaxed tracking-wide font-medium">
            Subscribe to receive priority notifications on private reserve collection releases, restocks, and exclusive membership offers.
          </p>

          {subscribed ? (
            <div className="max-w-md mx-auto bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-4 rounded text-sm text-[#D4AF37] tracking-wider font-semibold">
              Thank you for subscribing. Welcome to the inner circle.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3 pt-4">
              <div className="relative w-full">
                <Mail className="absolute left-3 top-3 w-4.5 h-4.5 text-[#AEAEB2]" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-[#1F1F23] rounded pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold tracking-widest uppercase rounded transition shrink-0"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
