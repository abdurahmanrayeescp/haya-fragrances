'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { BrandCarousel } from '../components/BrandCarousel';
import { ProductCard, Product } from '../components/ProductCard';
import { Testimonials } from '../components/Testimonials';
import { NewsletterSection } from '../components/NewsletterSection';
import { Footer } from '../components/Footer';
import { api } from '../lib/api';
import { Sparkles, Compass, HelpCircle } from 'lucide-react';
import Link from 'next/link';

import { useTranslation } from '../store/useI18nStore';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Fallback products in case backend hasn't booted up or database is seeding
  const fallbackProducts: Product[] = [
    {
      id: 1,
      name: "Lost Cherry",
      brand: "Tom Ford",
      category: "Unisex",
      description: "Lost Cherry is a full-bodied journey into the once-forbidden; a contrasting scent that reveals a tempting dichotomy.",
      notes: "Black Cherry, Bitter Almond",
      price: 395.0,
      stock: 15,
      image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
      rating: 4.8
    },
    {
      id: 2,
      name: "Bleu de Chanel",
      brand: "Chanel",
      category: "Men",
      description: "An ode to masculine freedom expressed in a woody aromatic fragrance with a captivating trail.",
      notes: "Grapefruit, Mint, Cedarwood",
      price: 150.0,
      stock: 25,
      image_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
      rating: 4.7
    },
    {
      id: 3,
      name: "No. 5 Parfum",
      brand: "Chanel",
      category: "Women",
      description: "The very essence of femininity. An abstract, mysterious, powdered floral bouquet.",
      notes: "Aldehydes, Iris, Rose",
      price: 210.0,
      stock: 12,
      image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
      rating: 4.9
    },
    {
      id: 4,
      name: "Sauvage Elixir",
      brand: "Dior",
      category: "Men",
      description: "Sauvage Elixir is an extraordinarily concentrated fragrance steeped in the iconic freshness.",
      notes: "Cardamom, Lavender, Amber",
      price: 230.0,
      stock: 8,
      image_url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600",
      rating: 4.8
    }
  ];

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await api.get('/products?size=4');
        if (response.data?.items?.length > 0) {
          setFeaturedProducts(response.data.items);
        } else {
          setFeaturedProducts(fallbackProducts);
        }
      } catch (error) {
        console.error("Failed to load backend products, loading luxury static list", error);
        setFeaturedProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen selection:bg-[#D4AF37] selection:text-black font-sans">
      <Navbar />
      <HeroSection />
      
      {/* Brand lists */}
      <BrandCarousel />
 
      {/* Featured Perfumes */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="flex items-center space-x-2 text-[#D4AF37] text-[10px] tracking-widest font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('home.productsSubtitle')}</span>
            </div>
            <h2 className="serif-title text-3xl md:text-5xl font-bold mt-2">{t('home.productsTitle')}</h2>
          </div>
          <Link
            href="/products"
            className="text-xs text-[#D4AF37] font-semibold tracking-widest uppercase hover:text-white transition flex items-center space-x-1.5 mt-4 md:mt-0"
          >
            <span>{t('navbar.collection')}</span>
            <Compass className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="glass-card rounded-lg h-[420px] p-5 space-y-4 animate-pulse">
                <div className="bg-white/5 h-64 w-full rounded" />
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-6 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials and newsletter */}
      <Testimonials />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
