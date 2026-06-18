'use client';

import { Star, Quote } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Victoria Sterling',
      role: 'Fragrance Collector',
      comment: 'LuxeAura has completely transformed how I purchase fragrances. Their curation is impeccable, and the packaging feels like receiving a royal treasure.',
      rating: 5
    },
    {
      name: 'Gabriel Vance',
      role: 'Fashion Consultant',
      comment: 'The Santal 33 I ordered arrived within 2 days in a stunning matte black case. The AI fragrance recommendation was shockingly accurate, matching my notes perfectly.',
      rating: 5
    },
    {
      name: 'Isabella Moretti',
      role: 'Sommelier',
      comment: 'For a long time, I searched for a site that treats olfactory notes with the seriousness of fine wine. LuxeAura is the absolute gold standard.',
      rating: 5
    }
  ];

  return (
    <div className="py-20 bg-[#0b0b0b] font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">TESTIMONIALS</span>
          <h2 className="serif-title text-3xl md:text-4xl font-bold text-white mt-2">What Our Connoisseurs Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass-card p-8 rounded-lg relative flex flex-col justify-between">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#D4AF37]/10" />
              
              <div className="space-y-4">
                <div className="flex space-x-1 text-[#D4AF37]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-sm text-[#AEAEB2] leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="mt-8 border-t border-[#1F1F23] pt-4 flex items-center justify-between">
                <div>
                  <h4 className="text-white text-sm font-semibold">{t.name}</h4>
                  <p className="text-[#AEAEB2] text-[11px] mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
