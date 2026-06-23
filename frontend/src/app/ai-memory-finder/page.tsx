'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { Sparkles, ShoppingCart, Heart, Star, Compass, RefreshCw, Send, HelpCircle } from 'lucide-react';

interface RecommendedProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  notes: string;
  price: number;
  image_url: string;
  rating: number;
  match_percentage: number;
}

interface MemoryFinderResponse {
  emotions: string[];
  notes: string[];
  description: string;
  recommendations: RecommendedProduct[];
}

export default function AIMemoryFinderPage() {
  const [memory, setMemory] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<MemoryFinderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const { hasItem, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  // Cycle through loading steps sequentially for a luxurious AI experience
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingPhase(0);
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev < 2 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memory.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post<MemoryFinderResponse>('/ai/memory-finder', {
        memory: memory.trim(),
      });
      
      // Artificial delay to allow loading animations to be fully appreciated
      await new Promise((resolve) => setTimeout(resolve, 4500));
      
      setResult(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze memory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMemory('');
    setResult(null);
    setError(null);
  };

  const selectExample = (exampleText: string) => {
    setMemory(exampleText);
  };

  const formatEmotionsString = (emotions: string[]) => {
    if (!emotions || emotions.length === 0) return '';
    const capitalized = emotions.map(e => e.charAt(0).toUpperCase() + e.slice(1));
    if (capitalized.length === 1) return capitalized[0];
    if (capitalized.length === 2) return `${capitalized[0]} and ${capitalized[1]}`;
    return `${capitalized.slice(0, -1).join(', ')}, and ${capitalized[capitalized.length - 1]}`;
  };

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-28 flex flex-col justify-center">
        
        {/* HERO SECTION */}
        {!result && !loading && (
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-1.5 rounded-full text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Olfactory Memory Concierge</span>
            </div>
            <h1 className="serif-title text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Turn Your <span className="gold-text-gradient">Memories</span> <br />Into Fragrance
            </h1>
            <p className="text-sm text-[#AEAEB2] leading-relaxed max-w-lg mx-auto">
              Describe a memory, emotion, place, or experience. Our premium AI model will translate your words into a luxury fragrance profile and find matching scents.
            </p>
          </div>
        )}

        {/* INPUT AREA */}
        {!result && !loading && (
          <div className="glass-card p-6 md:p-10 rounded-2xl max-w-2xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] tracking-widest text-[#AEAEB2] font-semibold uppercase mb-3">
                  Your Memory or Moment
                </label>
                <textarea
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                  placeholder="I remember rainy evenings, coffee, old books, and soft jazz music..."
                  maxLength={500}
                  className="w-full min-h-[140px] bg-black/40 border border-[#1F1F23] hover:border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl p-4.5 text-sm text-white placeholder-[#AEAEB2]/50 transition resize-none focus:outline-none"
                />
                <div className="flex justify-between items-center text-[10px] text-[#AEAEB2] mt-2">
                  <span>Describe places, feelings, seasons, or specific moments</span>
                  <span>{memory.length}/500</span>
                </div>
              </div>

              {/* Suggestions Chips */}
              <div className="space-y-2.5">
                <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-semibold">
                  Or select an inspiration:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Rainy evenings with coffee and books.",
                    "Walking on a beach at sunset.",
                    "A luxury hotel lobby in Dubai.",
                    "A peaceful mosque after Fajr prayer.",
                    "My wedding day."
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => selectExample(example)}
                      className="text-xs bg-[#1F1F23]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] border border-[#1F1F23] hover:border-[#D4AF37]/35 rounded-full px-3 py-1.5 transition text-[#AEAEB2]"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!memory.trim()}
                className="w-full shine-hover py-4 gold-bg-gradient hover:bg-gold-bg-gradient text-black text-xs font-bold tracking-widest uppercase rounded-xl flex items-center justify-center space-x-2 transition shadow-lg disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>Discover My Fragrance</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* LOADING EXPERIENCE */}
        {loading && (
          <div className="glass-card p-10 md:p-16 rounded-2xl max-w-xl mx-auto w-full text-center space-y-10">
            <div className="relative w-20 h-20 mx-auto">
              {/* Pulsing ring outer */}
              <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/10 animate-ping" />
              {/* Spinner inner */}
              <div className="absolute inset-2 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
              {/* Core icon */}
              <div className="absolute inset-4 rounded-full bg-black/60 border border-[#D4AF37]/25 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="serif-title text-2xl font-semibold text-white">Synthesizing Olfactory Memory</h3>
              <p className="text-xs text-[#AEAEB2] tracking-wider uppercase">Decoding your moment in time...</p>
            </div>

            {/* Loading Steps list */}
            <div className="max-w-xs mx-auto text-left space-y-4 border-t border-[#1F1F23] pt-6">
              {[
                { label: 'Analyzing emotions...', phase: 0 },
                { label: 'Extracting scent notes...', phase: 1 },
                { label: 'Finding fragrance matches...', phase: 2 }
              ].map((step, idx) => {
                const isActive = loadingPhase === step.phase;
                const isCompleted = loadingPhase > step.phase;
                return (
                  <div key={idx} className="flex items-center space-x-3 transition-opacity duration-300">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] text-[8px] font-bold">✓</div>
                      ) : isActive ? (
                        <div className="w-4 h-4 rounded-full border border-[#D4AF37] border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-[#1F1F23] border border-[#1F1F23]" />
                      )}
                    </div>
                    <span className={`text-xs ${isActive ? 'text-white font-semibold' : isCompleted ? 'text-[#AEAEB2]' : 'text-[#8E8E93]'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI ANALYSIS OUTPUT */}
        {result && (
          <div className="space-y-12">
            
            {/* Header Banner */}
            <div className="text-center max-w-xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-4.5 py-1.5 rounded-full text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">
                <span>OLFACTORY PROFILE UNLOCKED</span>
              </div>
              <h2 className="serif-title text-3xl sm:text-4xl md:text-5xl font-bold text-white">Memory Transformed</h2>
              <p className="text-xs text-[#AEAEB2] max-w-md mx-auto italic">
                &ldquo;{memory}&rdquo;
              </p>
            </div>

            {/* Analysis Detail Box */}
            <div className="glass-card p-6 md:p-10 rounded-2xl space-y-8">
              
              {/* Memory Interpretation */}
              <div className="space-y-2">
                <span className="block text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">Memory Interpretation</span>
                <p className="text-base text-[#F5F5F7] font-medium">
                  Your memory reflects {formatEmotionsString(result.emotions)}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-[#D4AF37]/10 py-8">
                {/* Emotional Profile badges */}
                <div className="space-y-3">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">Emotional Profile</span>
                  <div className="flex flex-wrap gap-2.5">
                    {result.emotions.map((emotion) => (
                      <span
                        key={emotion}
                        className="bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggested Scent Notes cards */}
                <div className="space-y-3">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">Suggested Scent Notes</span>
                  <div className="grid grid-cols-2 gap-2">
                    {result.notes.map((note) => (
                      <div
                        key={note}
                        className="bg-black/40 border border-[#1F1F23] hover:border-[#D4AF37]/20 rounded-lg px-3 py-2.5 flex items-center space-x-2 transition"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                        <span className="text-xs text-white capitalize truncate">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Poetic Description */}
              <div className="space-y-3">
                <span className="block text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">AI Luxury Description</span>
                <p className="serif-title text-lg md:text-xl text-[#F5F5F7] leading-relaxed font-normal italic">
                  &ldquo;{result.description}&rdquo;
                </p>
              </div>
            </div>

            {/* PRODUCT RECOMMENDATIONS */}
            <div className="space-y-8 pt-4">
              <div className="text-center space-y-2">
                <h3 className="serif-title text-2xl md:text-3xl font-bold text-white">Recommended Fragrances</h3>
                <p className="text-xs text-[#AEAEB2] tracking-wider uppercase">Curated from LuxeAura database</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {result.recommendations.map((prod) => {
                  const isWishlisted = hasItem(prod.id);
                  
                  const handleWishlistToggle = (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isWishlisted) {
                      removeFromWishlist(prod.id);
                    } else {
                      addToWishlist({
                        id: prod.id,
                        name: prod.name,
                        brand: prod.brand,
                        price: prod.price,
                        image_url: prod.image_url,
                        rating: prod.rating
                      });
                    }
                  };

                  const handleAddToCart = (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: prod.id,
                      name: prod.name,
                      brand: prod.brand,
                      price: prod.price,
                      image_url: prod.image_url,
                      stock: 10 // safe default stock limit
                    });
                  };

                  return (
                    <div key={prod.id} className="glass-card rounded-xl overflow-hidden flex flex-col group relative h-full">
                      
                      {/* Product Image and Match Badge */}
                      <Link href={`/products/${prod.id}`} className="relative h-64 w-full overflow-hidden block bg-black/40">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        
                        {/* Match Percentage Badge */}
                        <div className="absolute top-4 left-4 z-10 bg-[#D4AF37] text-black text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-lg shadow-black/30">
                          {prod.match_percentage}% MATCH
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={handleWishlistToggle}
                          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 border border-white/10 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] transition backdrop-blur-sm"
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
                        </button>

                        <span className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[9px] tracking-widest text-[#AEAEB2] uppercase font-bold">
                          {prod.category}
                        </span>
                      </Link>

                      {/* Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-semibold">{prod.brand}</span>
                          <Link href={`/products/${prod.id}`} className="block mt-1">
                            <h3 className="text-white text-sm font-semibold tracking-wide hover:text-[#D4AF37] transition truncate">
                              {prod.name}
                            </h3>
                          </Link>

                          {/* Scent notes inside card */}
                          <p className="text-[11px] text-[#AEAEB2] mt-2 line-clamp-1">
                            Notes: {prod.notes}
                          </p>

                          <div className="flex items-center space-x-1.5 mt-2">
                            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                            <span className="text-white text-xs font-semibold">{prod.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Buy/Cart Section */}
                        <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#1F1F23]">
                          <span className="text-white font-extrabold tracking-wide">${prod.price.toFixed(2)}</span>
                          <button
                            onClick={handleAddToCart}
                            className="flex items-center space-x-1.5 bg-[#D4AF37] text-black px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider hover:bg-[#E5C158] transition uppercase"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>ADD TO CART</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center pt-8">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] font-bold rounded-lg text-xs tracking-widest uppercase flex items-center space-x-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>TRANSLATE ANOTHER MEMORY</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
