'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProductCard, Product } from '../../components/ProductCard';
import { Search, Grid, List as ListIcon, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/useCartStore';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const categories = ['Men', 'Women', 'Unisex', 'Luxury Collection'];
  const brands = ['Dior', 'Chanel', 'Tom Ford', 'Versace', 'Armani', 'YSL'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: {
          search: search || undefined,
          category: category || undefined,
          brand: brand || undefined,
          sort_by: sortBy,
          page: page,
          size: 6
        }
      });
      setProducts(response.data.items);
      setTotalPages(response.data.pages);
      setTotalItems(response.data.total);
    } catch (error) {
      console.error('Failed to load products', error);
      // Fallback local products if backend down
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, brand, sortBy, page]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-28 space-y-8">
        {/* Title */}
        <div className="border-b border-[#1F1F23] pb-6">
          <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">LUXURY ARCHIVES</span>
          <h1 className="serif-title text-3xl md:text-5xl font-bold text-white mt-1">The Fragrance Collection</h1>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121214]/60 border border-[#D4AF37]/10 p-4 rounded-xl backdrop-blur">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#AEAEB2]" />
            <input
              type="text"
              placeholder="Search perfumes, brands, notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-black/50 border border-[#1F1F23] rounded pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-black/50 border border-[#1F1F23] text-xs text-[#AEAEB2] rounded px-4 py-2.5 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="newest">Sort: New Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
            </select>

            {/* Grid / List toggle */}
            <div className="flex items-center space-x-1 border border-[#1F1F23] rounded p-1 bg-black/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition ${viewMode === 'grid' ? 'bg-[#D4AF37] text-black' : 'text-[#AEAEB2] hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-[#D4AF37] text-black' : 'text-[#AEAEB2] hover:text-white'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Catalog layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Side Filters */}
          <div className="space-y-6 lg:border-r lg:border-[#1F1F23] lg:pr-8">
            <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3">
              <span className="text-xs font-bold tracking-widest text-white flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                <span>FILTERS</span>
              </span>
              <button
                onClick={handleClearFilters}
                className="text-[10px] text-[#D4AF37] hover:underline uppercase tracking-wider font-semibold"
              >
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h4 className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">CATEGORY</h4>
              <div className="flex flex-col space-y-2 text-xs">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCategory(category === c ? '' : c);
                      setPage(1);
                    }}
                    className={`text-left py-1 hover:text-[#D4AF37] transition font-medium ${category === c ? 'text-[#D4AF37] font-semibold pl-2 border-l-2 border-[#D4AF37]' : 'text-[#AEAEB2]'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-3">
              <h4 className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">BRAND</h4>
              <div className="flex flex-col space-y-2 text-xs">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setBrand(brand === b ? '' : b);
                      setPage(1);
                    }}
                    className={`text-left py-1 hover:text-[#D4AF37] transition font-medium ${brand === b ? 'text-[#D4AF37] font-semibold pl-2 border-l-2 border-[#D4AF37]' : 'text-[#AEAEB2]'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid / List */}
          <div className="lg:col-span-3 space-y-12">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="glass-card rounded-lg h-[420px] p-5 space-y-4 animate-pulse">
                    <div className="bg-white/5 h-64 w-full rounded" />
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-6 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-[#AEAEB2] text-sm tracking-wider font-medium">No fragrances match your selected criteria.</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-[#D4AF37] text-black px-6 py-3 rounded text-xs tracking-widest uppercase font-semibold hover:bg-[#E5C158] transition"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              // List View
              <div className="flex flex-col space-y-6">
                {products.map((product) => (
                  <div key={product.id} className="glass-card rounded-lg p-5 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-full sm:w-48 h-48 bg-black/40 border border-[#D4AF37]/10 rounded overflow-hidden flex-shrink-0">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-semibold">{product.brand}</span>
                        <h3 className="text-white text-base font-bold tracking-wide mt-1">{product.name}</h3>
                        <p className="text-[#AEAEB2] text-xs mt-2 line-clamp-2">{product.description}</p>
                        <p className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-widest mt-3">Notes: {product.notes || 'N/A'}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-white font-bold text-lg">${product.price.toFixed(2)}</span>
                        <button
                          onClick={() => {
                            const addItem = useCartStore.getState().addItem;
                            addItem({
                              id: product.id,
                              name: product.name,
                              brand: product.brand,
                              price: product.price,
                              image_url: product.image_url,
                              stock: product.stock
                            });
                          }}
                          disabled={product.stock <= 0}
                          className="bg-[#D4AF37] text-black px-5 py-2.5 rounded text-xs font-bold hover:bg-[#E5C158] disabled:bg-[#1F1F23] disabled:text-[#AEAEB2] transition uppercase tracking-widest"
                        >
                          {product.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO BAG'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-6 border-t border-[#1F1F23] pt-8 text-xs tracking-widest text-[#AEAEB2]">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="flex items-center space-x-1 hover:text-white transition disabled:opacity-30 disabled:hover:text-[#AEAEB2]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>PREVIOUS</span>
                </button>
                <span className="text-white font-bold">
                  PAGE {page} OF {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="flex items-center space-x-1 hover:text-white transition disabled:opacity-30 disabled:hover:text-[#AEAEB2]"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
