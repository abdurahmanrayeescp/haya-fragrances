'use client';

export function BrandCarousel() {
  const brands = [
    { name: 'DIOR' },
    { name: 'CHANEL' },
    { name: 'TOM FORD' },
    { name: 'VERSACE' },
    { name: 'ARMANI' },
    { name: 'YSL' }
  ];

  return (
    <div className="w-full bg-[#121214]/40 border-y border-[#D4AF37]/10 py-10 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <h4 className="text-[10px] tracking-widest text-[#D4AF37] font-semibold text-center uppercase mb-8">
          OUR RETAILER PARTNERS
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-60">
          {brands.map((b, idx) => (
            <div
              key={idx}
              className="serif-title text-xl md:text-2xl font-bold tracking-[0.2em] text-white hover:text-[#D4AF37] hover:opacity-100 transition cursor-default"
            >
              {b.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
