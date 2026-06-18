'use client';

import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProductCard, Product } from '../../components/ProductCard';
import { useWishlistStore } from '../../store/useWishlistStore';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  // Map minimal WishlistItem format to full Product format for rendering in ProductCard
  const productsMapped: Product[] = items.map((i) => ({
    id: i.id,
    name: i.name,
    brand: i.brand,
    price: i.price,
    image_url: i.image_url,
    rating: i.rating,
    category: 'Wishlist',
    description: '',
    notes: '',
    stock: 10 // Mock stock availability for add button
  }));

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-28 space-y-8">
        <div className="border-b border-[#1F1F23] pb-6 flex items-center space-x-3">
          <Heart className="w-8 h-8 text-[#D4AF37] fill-[#D4AF37]" />
          <div>
            <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">SAVED COLLECTION</span>
            <h1 className="serif-title text-3xl md:text-5xl font-bold text-white mt-0.5">My Wishlist</h1>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
            <Heart className="w-12 h-12 text-[#AEAEB2]" />
            <p className="text-sm text-[#AEAEB2] tracking-wide font-medium">Your wishlist is currently empty.</p>
            <Link
              href="/products"
              className="bg-[#D4AF37] text-black px-6 py-3 rounded text-xs tracking-widest uppercase font-bold hover:bg-[#E5C158] transition"
            >
              BROWSE CATALOG
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productsMapped.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
