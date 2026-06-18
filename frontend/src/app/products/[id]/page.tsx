'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { ProductCard, Product } from '../../../components/ProductCard';
import { useCartStore } from '../../../store/useCartStore';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { Star, ShoppingCart, Heart, Plus, Minus, Send, CheckCircle } from 'lucide-react';
import { api } from '../../../lib/api';

interface Review {
  id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    name: string;
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const trackViewedProduct = useCartStore((state) => state.trackViewedProduct);
  const { hasItem, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Quantity selector
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
      setRelated(response.data.related);
      
      // Track recently viewed
      if (response.data.product) {
        trackViewedProduct(response.data.product.id);
      }

      // Fetch reviews
      const reviewResp = await api.get(`/reviews/${id}`);
      setReviews(reviewResp.data);
    } catch (error) {
      console.error('Failed to load product details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[#AEAEB2] text-xs tracking-widest uppercase">LOADING LUXURY ARCHIVES...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <h2 className="serif-title text-2xl font-semibold">Fragrance Not Found</h2>
          <button onClick={() => router.push('/products')} className="bg-[#D4AF37] text-black px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest">
            BACK TO CATALOG
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isWishlisted = hasItem(product.id);

  const handleWishlistToggle = () => {
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

  const handleAddToCart = () => {
    // Add multiple items based on quantity counter
    for (let idx = 0; idx < quantity; idx++) {
      addItem({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock
      });
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await api.post('/reviews', {
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess('Thank you! Your review has been added.');
      setReviewComment('');
      
      // Reload product details to update rating averages and list
      fetchProductDetails();
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const splitNotes = product.notes ? product.notes.split(',') : [];

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-28 space-y-16">
        {/* Product core specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Product visual preview */}
          <div className="bg-black/40 border border-[#D4AF37]/10 rounded-2xl overflow-hidden h-[500px] relative">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            <button
              onClick={handleWishlistToggle}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 border border-white/10 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] transition backdrop-blur-md"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
            </button>
          </div>

          {/* Right: Info and checkout options */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs tracking-widest text-[#D4AF37] font-semibold uppercase">{product.brand}</span>
                <h1 className="serif-title text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-1">{product.name}</h1>
              </div>

              {/* Rating stars count */}
              <div className="flex items-center space-x-2">
                <div className="flex text-[#D4AF37]">
                  <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                </div>
                <span className="text-sm font-semibold text-white">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-[#AEAEB2]">({reviews.length} customer reviews)</span>
              </div>

              {/* Pricing */}
              <div className="text-2xl font-bold tracking-widest text-white">${product.price.toFixed(2)}</div>

              {/* Description */}
              <p className="text-sm text-[#AEAEB2] leading-relaxed font-medium">{product.description}</p>

              <hr className="border-[#1F1F23]" />

              {/* Olfactory profile notes */}
              {splitNotes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">OLFACTORY PROFILE NOTES</h4>
                  <div className="flex flex-wrap gap-2">
                    {splitNotes.map((note) => (
                      <span key={note} className="bg-black/60 border border-[#D4AF37]/20 px-3.5 py-1.5 rounded-full text-xs font-medium text-white">
                        {note.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory tag */}
              <div className="text-xs font-semibold">
                <span>AVAILABILITY: </span>
                {product.stock > 0 ? (
                  <span className="text-green-500">IN STOCK ({product.stock} units)</span>
                ) : (
                  <span className="text-[#FF453A]">OUT OF STOCK</span>
                )}
              </div>
            </div>

            {/* Form selectors */}
            {product.stock > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-6">
                  <span className="text-xs tracking-widest text-[#AEAEB2] font-semibold">QUANTITY</span>
                  <div className="flex items-center border border-[#1F1F23] rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-[#AEAEB2] hover:text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 text-sm text-white font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 text-[#AEAEB2] hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs tracking-widest uppercase rounded flex items-center justify-center space-x-2 transition"
                  >
                    <ShoppingCart className="w-4.5 h-4.5" />
                    <span>ADD TO SHOPPING BAG</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews and Ratings system */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-[#1F1F23] pt-16">
          {/* Write a review form */}
          <div className="space-y-6">
            <h3 className="serif-title text-xl font-bold text-white tracking-wider">Leave a Review</h3>
            {isAuthenticated ? (
              <form onSubmit={handlePostReview} className="space-y-4 text-xs font-medium tracking-wider text-[#AEAEB2]">
                {reviewSuccess && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-3 rounded flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{reviewSuccess}</span>
                  </div>
                )}
                {reviewError && (
                  <div className="bg-[#FF453A]/10 border border-[#FF453A]/30 text-[#FF453A] p-3 rounded">
                    {reviewError}
                  </div>
                )}

                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label>RATING STARS</label>
                  <div className="flex space-x-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment area */}
                <div className="space-y-1.5">
                  <label htmlFor="comment">YOUR COMMENTS</label>
                  <textarea
                    id="comment"
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your experience with this fragrance..."
                    className="w-full bg-black/60 border border-[#1F1F23] rounded p-4 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold rounded text-[11px] tracking-widest uppercase transition flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'SUBMITTING...' : 'SUBMIT REVIEW'}</span>
                </button>
              </form>
            ) : (
              <div className="bg-[#121214] border border-[#1F1F23] p-6 rounded text-center space-y-3">
                <p className="text-[#AEAEB2] text-xs">You must be signed in to post a product rating review.</p>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-[#D4AF37] text-black px-4 py-2 rounded text-[10px] tracking-widest font-semibold uppercase hover:bg-[#E5C158]"
                >
                  SIGN IN TO REVIEW
                </button>
              </div>
            )}
          </div>

          {/* Customers Reviews list */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="serif-title text-xl font-bold text-white tracking-wider">Customer Reviews ({reviews.length})</h3>
            <div className="space-y-6 max-h-[420px] overflow-y-auto pr-4">
              {reviews.length === 0 ? (
                <p className="text-[#AEAEB2] text-xs tracking-wider">No reviews have been posted for this product yet.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-[#121214]/40 border border-[#1F1F23] p-5 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white text-xs font-semibold">{rev.user?.name || 'Anonymous customer'}</h4>
                      <span className="text-[10px] text-[#AEAEB2]">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Stars indicator */}
                    <div className="flex text-[#D4AF37]">
                      {[...Array(rev.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                      ))}
                    </div>

                    <p className="text-xs text-[#AEAEB2] leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Related Fragrances */}
        {related.length > 0 && (
          <div className="border-t border-[#1F1F23] pt-16 space-y-8">
            <div className="text-center md:text-left">
              <span className="text-[10px] tracking-widest text-[#D4AF37] font-semibold uppercase">YOU MAY ALSO LOVE</span>
              <h3 className="serif-title text-2xl md:text-3xl font-bold text-white mt-1">Related Fragrances</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
