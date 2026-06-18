'use client';

import Link from 'next/link';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { ShoppingCart, Heart, Star } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  notes: string;
  price: number;
  stock: number;
  image_url: string;
  rating: number;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { hasItem, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const isWishlisted = hasItem(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image_url: product.image_url,
        rating: product.rating
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock
    });
  };

  return (
    <div className="glass-card rounded-lg overflow-hidden flex flex-col group h-full relative font-sans">
      {/* Product Image Panel */}
      <Link href={`/products/${product.id}`} className="relative h-72 w-full overflow-hidden block bg-black/40">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Shine hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Wishlist Heart Icon */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 border border-white/10 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] transition backdrop-blur-sm"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
        </button>

        {/* Category tag */}
        <span className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded text-[10px] tracking-widest text-[#AEAEB2] uppercase font-semibold">
          {product.category}
        </span>
      </Link>

      {/* Product Card Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-semibold">{product.brand}</span>
          <Link href={`/products/${product.id}`} className="block mt-1">
            <h3 className="text-white text-sm font-semibold tracking-wide hover:text-[#D4AF37] transition truncate">
              {product.name}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="flex items-center space-x-1.5 mt-2">
            <div className="flex text-[#D4AF37]">
              <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            </div>
            <span className="text-white text-xs font-semibold">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Price and Cart Add button */}
        <div className="flex items-center justify-between mt-5">
          <span className="text-white font-bold tracking-wide">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="flex items-center space-x-1.5 bg-[#D4AF37] text-black px-3.5 py-2 rounded text-xs font-bold tracking-wider hover:bg-[#E5C158] disabled:bg-[#1F1F23] disabled:text-[#AEAEB2] transition uppercase"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{product.stock <= 0 ? 'OUT OF STOCK' : 'ADD'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
