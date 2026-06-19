'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { adminApi } from '../../../lib/adminApi';
import {
  Plus, Edit, Trash2, X, Search, Package,
  Upload, ImageIcon, Loader2, CheckCircle, AlertCircle,
} from 'lucide-react';

/* ─── types ─────────────────────────────────────────────────────────── */
interface Product {
  id:          number;
  name:        string;
  brand:       string;
  category:    string;
  price:       number;
  stock:       number;
  image_url:   string;
  description: string;
  notes:       string;
}

const EMPTY_FORM = {
  name: '', brand: '', category: 'Unisex',
  description: '', notes: '', price: 100, stock: 10, image_url: '',
};

const INPUT_CLS =
  'w-full bg-[#0B0B0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all placeholder-[#3A3A3C]';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_MB = 5;

/* ─── Image Upload Component ─────────────────────────────────────────── */
interface ImageUploaderProps {
  value:    string;           // current image_url stored in form
  onChange: (url: string) => void;
}

function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging,    setDragging]    = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploaded,    setUploaded]    = useState(false);
  const [urlMode,     setUrlMode]     = useState(false); // show plain URL input

  /* Upload a File to the backend → Cloudinary */
  const uploadFile = useCallback(async (file: File) => {
    setUploadError('');
    setUploaded(false);

    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(`Unsupported type "${file.type}". Use JPG, PNG, WebP or GIF.`);
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`File is too large (max ${MAX_MB} MB).`);
      return;
    }

    // Show a local preview immediately while uploading
    const previewUrl = URL.createObjectURL(file);
    onChange(previewUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await adminApi.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);   // replace preview blob with the real CDN URL
      setUploaded(true);
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload failed. Check Cloudinary env vars on Railway.');
      onChange('');             // clear bad preview
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  }, [onChange]);

  /* Drag-and-drop handlers */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  /* File input change */
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // reset so the same file can be re-selected
    e.target.value = '';
  };

  const clearImage = () => {
    onChange('');
    setUploaded(false);
    setUploadError('');
  };

  /* ── Render ── */
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">
          Product Image
        </label>
        <button
          type="button"
          onClick={() => { setUrlMode((v) => !v); setUploadError(''); }}
          className="text-[10px] text-[#D4AF37] hover:underline"
        >
          {urlMode ? '← Upload file' : 'Paste URL instead →'}
        </button>
      </div>

      {/* ── URL mode ── */}
      {urlMode ? (
        <input
          type="text"
          placeholder="https://example.com/perfume.jpg"
          className={INPUT_CLS}
          value={value}
          onChange={(e) => { onChange(e.target.value); setUploaded(false); }}
        />
      ) : (
        <>
          {/* Image preview */}
          {value && (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#D4AF37]/30 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
              {/* Upload overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                  <p className="text-xs text-white">Uploading to Cloudinary…</p>
                </div>
              )}
              {/* Success badge */}
              {uploaded && !uploading && (
                <div className="absolute top-2 left-2 flex items-center space-x-1 bg-green-500/20 border border-green-500/40 rounded-md px-2 py-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400 font-bold">Uploaded</span>
                </div>
              )}
              {/* Remove button */}
              {!uploading && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-[#FF453A]/80 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Drop zone (shown when no image) */}
          {!value && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                dragging
                  ? 'border-[#D4AF37]/70 bg-[#D4AF37]/5 scale-[0.99]'
                  : 'border-[#1F1F23] hover:border-[#D4AF37]/40 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex flex-col items-center space-y-2 pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-white font-medium">
                    {dragging ? 'Drop to upload' : 'Drag & drop your image here'}
                  </p>
                  <p className="text-[11px] text-[#AEAEB2] mt-0.5">
                    or <span className="text-[#D4AF37]">click to browse</span>
                  </p>
                  <p className="text-[10px] text-[#3A3A3C] mt-1">
                    JPG · PNG · WebP · GIF — max {MAX_MB} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Re-upload button (when image present and not uploading) */}
          {value && !uploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg border border-[#1F1F23] hover:border-[#D4AF37]/40 text-xs text-[#AEAEB2] hover:text-white transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Replace image</span>
            </button>
          )}
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Error message */}
      {uploadError && (
        <div className="flex items-start space-x-2 bg-[#FF453A]/10 border border-[#FF453A]/30 rounded-lg px-3 py-2.5">
          <AlertCircle className="w-4 h-4 text-[#FF453A] flex-shrink-0 mt-0.5" />
          <p className="text-[#FF453A] text-xs leading-relaxed">{uploadError}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function AdminProductsPage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const r = await adminApi.get('/products?size=100');
      setProducts(r.data.items ?? r.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name:        p.name,
      brand:       p.brand,
      category:    p.category,
      description: p.description,
      notes:       p.notes ?? '',
      price:       p.price,
      stock:       p.stock,
      image_url:   p.image_url ?? '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url:
        form.image_url ||
        'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
    };
    try {
      if (editingId) {
        await adminApi.put(`/products/${editingId}`, payload);
      } else {
        await adminApi.post('/products', payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message ?? 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete product');
    }
  };

  return (
    <div className="p-8 space-y-6">

      {/* ── Header ── */}
      <div className="border-b border-[#1F1F23] pb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-[#D4AF37] font-bold uppercase">Management</p>
          <h1
            className="text-3xl font-bold text-white mt-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Products
          </h1>
        </div>
        <button
          id="add-product-btn"
          onClick={openAdd}
          className="flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs tracking-widest uppercase px-5 py-2.5 rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A3A3C]" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111113] border border-[#1F1F23] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder-[#3A3A3C]"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#8E8E93]">
            <Package className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1F1F23] text-[#AEAEB2] font-bold tracking-widest uppercase text-[10px]">
                  <th className="text-left px-5 py-4">Image</th>
                  <th className="text-left py-4">Name</th>
                  <th className="text-left py-4">Brand</th>
                  <th className="text-left py-4">Category</th>
                  <th className="text-left py-4">Price</th>
                  <th className="text-left py-4">Stock</th>
                  <th className="text-right px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {filtered.map((p) => (
                  <tr key={p.id} className="text-white hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#1F1F23]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#1F1F23] flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-[#3A3A3C]" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 font-semibold">{p.name}</td>
                    <td className="py-3 text-[#AEAEB2]">{p.brand}</td>
                    <td className="py-3 text-[#AEAEB2]">{p.category}</td>
                    <td className="py-3 font-semibold">${p.price.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`font-bold ${p.stock < 5 ? 'text-red-400' : 'text-green-400'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 text-right px-5 space-x-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                        aria-label="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111113] border border-[#D4AF37]/20 rounded-2xl p-7 relative shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#8E8E93] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2
              className="text-xl font-bold text-white mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {editingId ? 'Edit Fragrance' : 'Add Fragrance'}
            </h2>

            {error && (
              <div className="mb-4 bg-[#FF453A]/10 border border-[#FF453A]/30 rounded-lg px-4 py-2.5">
                <p className="text-[#FF453A] text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name + Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Name *</label>
                  <input
                    required
                    className={INPUT_CLS}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Brand *</label>
                  <input
                    required
                    className={INPUT_CLS}
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Category</label>
                <select
                  className={INPUT_CLS}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option>Men</option>
                  <option>Women</option>
                  <option>Unisex</option>
                  <option>Luxury Collection</option>
                </select>
              </div>

              {/* ── Image Uploader ── */}
              <ImageUploader
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
              />

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Price ($) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step={0.01}
                    className={INPUT_CLS}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Stock *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    className={INPUT_CLS}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">
                  Notes (comma separated)
                </label>
                <input
                  className={INPUT_CLS}
                  placeholder="Bergamot, Patchouli, Sandalwood…"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-[#AEAEB2] font-bold uppercase">Description *</label>
                <textarea
                  required
                  rows={3}
                  className={`${INPUT_CLS} resize-none`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:from-[#E5C158] hover:to-[#C49221] disabled:opacity-50 text-black font-bold text-xs tracking-widest uppercase rounded-lg transition-all duration-200 mt-2 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving…</span></>
                ) : (
                  <span>{editingId ? 'Update Product' : 'Create Product'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
