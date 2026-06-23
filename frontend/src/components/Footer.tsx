'use client';

import Link from 'next/link';
import { useTranslation } from '../store/useI18nStore';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-black border-t border-[#1F1F23] pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 mb-12">
        {/* Brand */}
        <div className="space-y-4">
          <h3 className="serif-title text-2xl font-bold tracking-wider text-white">LUXEAURA</h3>
          <p className="text-xs text-[#AEAEB2] leading-relaxed max-w-xs">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Shop columns */}
        <div>
          <h4 className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase mb-4">SHOP</h4>
          <ul className="space-y-2 text-xs text-[#AEAEB2]">
            <li><Link href="/products?category=Men" className="hover:text-white transition">Men's Fragrances</Link></li>
            <li><Link href="/products?category=Women" className="hover:text-white transition">Women's Fragrances</Link></li>
            <li><Link href="/products?category=Unisex" className="hover:text-white transition">Unisex Blends</Link></li>
            <li><Link href="/products?category=Luxury Collection" className="hover:text-white transition">Reserve Collection</Link></li>
          </ul>
        </div>

        {/* Discovery columns */}
        <div>
          <h4 className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase mb-4">EXPLORE</h4>
          <ul className="space-y-2 text-xs text-[#AEAEB2]">
            <li><Link href="/ai-recommend" className="hover:text-white transition">{t('navbar.aiFinder')}</Link></li>
            <li><Link href="/#testimonials" className="hover:text-white transition">{t('products.reviews')}</Link></li>
            <li><Link href="/#brands" className="hover:text-white transition">Retailing Brands</Link></li>
          </ul>
        </div>

        {/* Contact columns */}
        <div>
          <h4 className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase mb-4">HOUSE OF LUXE</h4>
          <p className="text-xs text-[#AEAEB2] leading-relaxed">
            100 Champs-Élysées, Paris, France <br />
            concierge@luxeaura.com <br />
            +33 (0) 1 40 76 53 00
          </p>
        </div>
      </div>

      {/* Under footer */}
      <div className="max-w-7xl mx-auto px-6 border-t border-[#1F1F23] pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#AEAEB2]">
        <p>&copy; {new Date().getFullYear()} LUXEAURA. {t('footer.rights')}</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Accessibility</a>
        </div>
      </div>
    </footer>
  );
}
