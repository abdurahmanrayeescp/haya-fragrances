'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { api } from '../../lib/api';
import { useTranslation } from '../../store/useI18nStore';
import { Sparkles, Copy, Check, RefreshCw, Compass, Users, Package, Eye, ChevronRight, Wand2 } from 'lucide-react';

interface PerfumeCreatorResponse {
  perfume_name: string;
  story: string;
  slogan: string;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  bottle_style: string;
  bottle_color: string;
  packaging_style: string;
  target_audience: string;
  luxury_score: number;
  image_prompt: string;
}

export default function AIPerfumeCreatorPage() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<PerfumeCreatorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Bottle Image generation states
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState('');

  // 5 loading stages sequence
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingPhase(0);
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev < 4 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setGeneratedImageUrl(null);
    setEditablePrompt('');

    try {
      const response = await api.post<PerfumeCreatorResponse>('/ai/perfume-creator', {
        description: description.trim()
      });

      // Luxurious delay to experience the 5 loading stages
      await new Promise((resolve) => setTimeout(resolve, 7500));

      setResult(response.data);
      setEditablePrompt(response.data.image_prompt);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to formulate perfume concept. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBottleImage = async () => {
    if (!editablePrompt.trim()) return;

    setGeneratingImage(true);
    try {
      const response = await api.post<{ image_url: string }>('/ai/generate-bottle', {
        image_prompt: editablePrompt.trim()
      });
      setGeneratedImageUrl(response.data.image_url);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!editablePrompt) return;
    navigator.clipboard.writeText(editablePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setDescription('');
    setResult(null);
    setError(null);
    setGeneratedImageUrl(null);
    setEditablePrompt('');
  };

  const selectExample = (exampleText: string) => {
    setDescription(exampleText);
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
              <span>{t('navbar.perfumeCreator')}</span>
            </div>
            <h1 className="serif-title text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {t('perfumeCreator.title')}
            </h1>
            <p className="text-sm text-[#AEAEB2] leading-relaxed max-w-lg mx-auto">
              {t('perfumeCreator.subtitle')}
            </p>
          </div>
        )}

        {/* INPUT FORM */}
        {!result && !loading && (
          <div className="glass-card p-6 md:p-10 rounded-2xl max-w-2xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] tracking-widest text-[#AEAEB2] font-semibold uppercase mb-3">
                  {t('perfumeCreator.inputLabel')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('perfumeCreator.inputPlaceholder')}
                  maxLength={500}
                  className="w-full min-h-[140px] bg-black/40 border border-[#1F1F23] hover:border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl p-4.5 text-sm text-white placeholder-[#AEAEB2]/50 transition resize-none focus:outline-none"
                />
                <div className="flex justify-between items-center text-[10px] text-[#AEAEB2] mt-2">
                  <span>Enter emotions, visuals, or ingredients in natural language</span>
                  <span>{description.length}/500</span>
                </div>
              </div>

              {/* Inspiration Suggestions */}
              <div className="space-y-2.5">
                <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-semibold">
                  {t('perfumeCreator.suggestionsLabel')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Rainy evenings in Kerala with coffee and books",
                    "Walking on a golden beach at sunset with ocean wind",
                    "A quiet walk in a damp pine forest in winter",
                    "An elegant outdoor garden wedding ceremony",
                    "The opulent lobby of a luxury hotel in Dubai"
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => selectExample(example)}
                      className="text-xs bg-[#1F1F23]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] border border-[#1F1F23] hover:border-[#D4AF37]/35 rounded-full px-3.5 py-1.5 transition text-[#AEAEB2] text-left"
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
                disabled={!description.trim()}
                className="w-full shine-hover py-4 gold-bg-gradient hover:bg-gold-bg-gradient text-black text-xs font-bold tracking-widest uppercase rounded-xl flex items-center justify-center space-x-2 transition shadow-lg disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>{t('perfumeCreator.btnCreate')}</span>
                <Wand2 className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* SIMULATED LOADING PHASE */}
        {loading && (
          <div className="glass-card p-10 md:p-16 rounded-2xl max-w-xl mx-auto w-full text-center space-y-10">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/10 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
              <div className="absolute inset-4 rounded-full bg-black/60 border border-[#D4AF37]/25 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="serif-title text-2xl font-semibold text-white">{t('perfumeCreator.loadingTitle')}</h3>
              <p className="text-xs text-[#AEAEB2] tracking-wider uppercase">{t('perfumeCreator.loadingSubtitle')}</p>
            </div>

            {/* Load steps list */}
            <div className="max-w-xs mx-auto text-left space-y-4 border-t border-[#1F1F23] pt-6">
              {[
                { label: t('perfumeCreator.phase0'), phase: 0 },
                { label: t('perfumeCreator.phase1'), phase: 1 },
                { label: t('perfumeCreator.phase2'), phase: 2 },
                { label: t('perfumeCreator.phase3'), phase: 3 },
                { label: t('perfumeCreator.phase4'), phase: 4 }
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
                        <div className="w-4 h-4 rounded-full bg-[#1F1F23]" />
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

        {/* RESULTS PANEL */}
        {result && (
          <div className="space-y-12">
            
            {/* Header Banner */}
            <div className="text-center max-w-xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-4 py-1 rounded-full text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">
                <span>{t('perfumeCreator.loadingTitle')}</span>
              </div>
              <h2 className="serif-title text-4xl sm:text-5xl font-bold text-white">{result.perfume_name}</h2>
              <p className="text-xs text-[#AEAEB2] tracking-widest uppercase italic font-semibold">
                &ldquo;{result.slogan}&rdquo;
              </p>
            </div>

            {/* Concept details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Scent Pyramid details (2/3 columns) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Brand Story card */}
                <div className="glass-card p-6 md:p-8 rounded-2xl space-y-3">
                  <span className="block text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">{t('perfumeCreator.story')}</span>
                  <p className="text-sm text-[#F5F5F7] leading-relaxed">
                    {result.story}
                  </p>
                </div>

                {/* Scent Pyramid card */}
                <div className="glass-card p-6 md:p-8 rounded-2xl space-y-6">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold mb-2">{t('perfumeCreator.notesTitle')}</span>
                  
                  {/* Top Notes */}
                  <div className="space-y-2 border-b border-[#1F1F23]/60 pb-4">
                    <span className="block text-[10px] tracking-widest text-[#D4AF37]/80 uppercase font-bold">{t('perfumeCreator.notesTop')}</span>
                    <div className="flex flex-wrap gap-2">
                      {result.top_notes.map((note) => (
                        <span key={note} className="bg-black/35 border border-[#1F1F23] rounded-lg px-3 py-1.5 text-xs text-white capitalize">{note}</span>
                      ))}
                    </div>
                  </div>

                  {/* Middle Notes */}
                  <div className="space-y-2 border-b border-[#1F1F23]/60 pb-4">
                    <span className="block text-[10px] tracking-widest text-[#D4AF37]/80 uppercase font-bold">{t('perfumeCreator.notesHeart')}</span>
                    <div className="flex flex-wrap gap-2">
                      {result.middle_notes.map((note) => (
                        <span key={note} className="bg-black/35 border border-[#1F1F23] rounded-lg px-3 py-1.5 text-xs text-white capitalize">{note}</span>
                      ))}
                    </div>
                  </div>

                  {/* Base Notes */}
                  <div className="space-y-2">
                    <span className="block text-[10px] tracking-widest text-[#D4AF37]/80 uppercase font-bold">{t('perfumeCreator.notesBase')}</span>
                    <div className="flex flex-wrap gap-2">
                      {result.base_notes.map((note) => (
                        <span key={note} className="bg-black/35 border border-[#1F1F23] rounded-lg px-3 py-1.5 text-xs text-white capitalize">{note}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Design and Packaging details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Bottle Design */}
                  <div className="glass-card p-6 rounded-2xl space-y-2.5">
                    <div className="flex items-center space-x-2 text-[#D4AF37]">
                      <Compass className="w-4 h-4" />
                      <span className="text-[10px] tracking-widest uppercase font-bold">{t('perfumeCreator.aestheticsTitle')}</span>
                    </div>
                    <p className="text-xs text-[#AEAEB2] leading-relaxed">
                      {t('perfumeCreator.aestheticsColor')}: <strong className="text-white capitalize">{result.bottle_color}</strong>
                    </p>
                    <p className="text-xs text-[#AEAEB2] leading-relaxed">
                      {t('perfumeCreator.aestheticsStyle')}: <span className="text-white capitalize">{result.bottle_style}</span>
                    </p>
                  </div>

                  {/* Packaging Design */}
                  <div className="glass-card p-6 rounded-2xl space-y-2.5">
                    <div className="flex items-center space-x-2 text-[#D4AF37]">
                      <Package className="w-4 h-4" />
                      <span className="text-[10px] tracking-widest uppercase font-bold">{t('perfumeCreator.packagingTitle')}</span>
                    </div>
                    <p className="text-xs text-white leading-relaxed capitalize">
                      {result.packaging_style}
                    </p>
                  </div>
                </div>

                {/* target audience and marketing copy */}
                <div className="glass-card p-6 md:p-8 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1F1F23]/60 pb-3">
                    <span className="text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">{t('perfumeCreator.marketingTitle')}</span>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="text-xs text-white font-semibold">{t('perfumeCreator.marketingAudience')}: {result.target_audience}</span>
                    </div>
                  </div>
                  <p className="serif-title text-base text-[#F5F5F7] italic leading-relaxed">
                    &ldquo;{result.story.split('.')[0]}. Experience Monsoon Noir, crafted for those who value quiet luxury and sensory timelessness.&rdquo;
                  </p>
                </div>

              </div>

              {/* Side panel: Luxury Score & Prompt Generator (1/3 column) */}
              <div className="space-y-8">
                
                {/* Luxury Score radial indicator */}
                <div className="glass-card p-6 md:p-8 rounded-2xl text-center space-y-4">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">{t('perfumeCreator.luxuryScore')}</span>
                  
                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    {/* Ring progress bar circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke="#1F1F23"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke="#D4AF37"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={326}
                        strokeDashoffset={326 - (326 * result.luxury_score) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-white">{result.luxury_score}</span>
                      <span className="text-[8px] tracking-widest text-[#D4AF37] uppercase font-bold">DECIBELS</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#AEAEB2] tracking-wider uppercase">
                    Exceptional olfactory complexity
                  </p>
                </div>

                {/* AI prompt copy box */}
                <div className="glass-card p-6 rounded-2xl space-y-4 text-left">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold font-semibold mb-1">{t('perfumeCreator.bottlePrompt')}</span>
                  
                  <textarea
                    value={editablePrompt}
                    onChange={(e) => setEditablePrompt(e.target.value)}
                    placeholder="Bottle design image prompt..."
                    className="w-full min-h-[90px] bg-black/60 border border-[#1F1F23] hover:border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-lg p-3 text-[11px] text-[#F5F5F7] leading-relaxed font-mono resize-y focus:outline-none"
                  />

                  <button
                    onClick={handleCopyPrompt}
                    className="w-full py-2.5 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] rounded-lg text-xs font-semibold tracking-wider uppercase flex items-center justify-center space-x-2 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('perfumeCreator.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t('perfumeCreator.copyPrompt')}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Generate Image Section */}
                <div className="glass-card p-6 rounded-2xl space-y-4 text-center">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">{t('perfumeCreator.designStudio')}</span>
                  
                  {generatedImageUrl ? (
                    <div className="space-y-4">
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black border border-[#1F1F23]">
                        <img
                          src={generatedImageUrl}
                          alt={result.perfume_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="block text-[9px] text-[#AEAEB2] uppercase tracking-wider">{t('perfumeCreator.visualMockup')}</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="aspect-square w-full rounded-lg bg-black/40 border border-dashed border-[#1F1F23] flex flex-col items-center justify-center text-[#8E8E93] text-center p-4">
                        <Package className="w-8 h-8 text-[#D4AF37]/40 mb-2" />
                        <span className="text-xs">{t('perfumeCreator.noVisual')}</span>
                      </div>
                      
                      <button
                        onClick={handleGenerateBottleImage}
                        disabled={generatingImage}
                        className="w-full py-3.5 bg-[#D4AF37] text-black rounded-lg text-xs font-bold tracking-widest uppercase flex items-center justify-center space-x-2 hover:bg-[#E5C158] transition shadow-lg shadow-[#D4AF37]/15 disabled:opacity-40"
                      >
                        {generatingImage ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{t('perfumeCreator.generating')}</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>{t('perfumeCreator.btnGenerate')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-center pt-8 border-t border-[#1F1F23]/60">
              <button
                onClick={handleReset}
                className="px-8 py-3.5 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] font-bold rounded-lg text-xs tracking-widest uppercase flex items-center space-x-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('perfumeCreator.btnReset')}</span>
              </button>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
