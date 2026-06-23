'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useTranslation } from '../../store/useI18nStore';
import { Sparkles, ShoppingCart, Heart, Star, Mic, Square, RefreshCw, Volume2, ShieldAlert } from 'lucide-react';

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

interface VoiceAnalysisResponse {
  transcript: string;
  moods: string[];
  energy: string;
  confidence_score: number;
  occasion: string;
  notes: string[];
  description: string;
  recommendations: RecommendedProduct[];
}

export default function AIVoiceFinderPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<VoiceAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const { hasItem, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  // Handle loading steps sequence
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingPhase(0);
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Handle 10 seconds recording limit
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTimer((prev) => {
          if (prev >= 10) {
            handleStopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setRecordingTimer(0);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    setError(null);
    setTranscript('');
    setResult(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please try Google Chrome, MS Edge, or Safari.');
      return;
    }

    try {
      // Request mic permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permissions in your browser settings.');
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        handleStopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      setIsRecording(true);
      recognition.start();
    } catch (err) {
      console.error('Mic initialization failed:', err);
      setError('Microphone access was denied. Please check your system/browser permission settings.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmitAnalysis = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post<VoiceAnalysisResponse>('/ai/voice-analysis', {
        transcript: transcript.trim()
      });

      // Luxurious processing delay
      await new Promise((resolve) => setTimeout(resolve, 6000));

      setResult(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze voice transcription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setResult(null);
    setError(null);
    setRecordingTimer(0);
  };

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-28 flex flex-col justify-center">
        
        {/* HERO SECTION */}
        {!result && !loading && (
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-1.5 rounded-full text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">
              <Mic className="w-3.5 h-3.5" />
              <span>{t('navbar.voiceFinder')}</span>
            </div>
            <h1 className="serif-title text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {t('voiceFinder.title')}
            </h1>
            <p className="text-sm text-[#AEAEB2] leading-relaxed max-w-lg mx-auto">
              {t('voiceFinder.subtitle')}
            </p>
          </div>
        )}

        {/* VOICE RECORDING INTERFACE */}
        {!result && !loading && (
          <div className="glass-card p-8 md:p-12 rounded-2xl max-w-xl mx-auto w-full text-center relative overflow-hidden">
            
            {/* Record Dashboard */}
            <div className="space-y-8 relative z-10">
              
              {/* Mic buttons and Waveform Visualizer */}
              <div className="flex flex-col items-center justify-center space-y-6">
                
                {/* Visual waves while recording */}
                {isRecording ? (
                  <div className="flex items-center justify-center space-x-1.5 h-16 w-64">
                    {[...Array(15)].map((_, idx) => (
                      <div
                        key={idx}
                        className="w-1 bg-[#D4AF37] rounded-full animate-bounce"
                        style={{
                          height: `${30 + Math.random() * 70}%`,
                          animationDelay: `${idx * 0.08}s`,
                          animationDuration: `${0.5 + Math.random() * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-16 flex items-center justify-center text-xs text-[#AEAEB2]/60 uppercase tracking-widest">
                    <span>{t('voiceFinder.listening')}</span>
                  </div>
                )}

                {/* Main Mic Button */}
                <div className="relative">
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-[#D4AF37]/25 animate-ping duration-1000" />
                  )}
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center border-2 shadow-2xl transition-all duration-300 relative z-10 ${
                      isRecording 
                        ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20' 
                        : 'bg-[#D4AF37]/10 border-[#D4AF37]/35 text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/20'
                    }`}
                  >
                    {isRecording ? (
                      <Square className="w-8 h-8 fill-current" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </button>
                </div>

                {/* Recording Timer and Status */}
                <div className="space-y-1">
                  <span className="block text-sm font-bold tracking-widest text-white uppercase">
                    {isRecording ? t('voiceFinder.listening') : t('voiceFinder.btnStart')}
                  </span>
                  {isRecording && (
                    <span className="block text-xs font-semibold text-[#D4AF37] tracking-wider animate-pulse">
                      0:0{recordingTimer} / 0:10 seconds
                    </span>
                  )}
                </div>
              </div>

              {/* Start & Stop Action Buttons */}
              <div className="flex justify-center space-x-4 border-t border-[#1F1F23]/60 pt-6">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="px-6 py-2.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] text-xs font-bold tracking-widest uppercase rounded-lg transition"
                  >
                    {t('voiceFinder.btnStart')}
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 text-xs font-bold tracking-widest uppercase rounded-lg transition"
                  >
                    {t('voiceFinder.btnStop')}
                  </button>
                )}
              </div>

              {/* Transcription Area */}
              <div className="space-y-3 pt-4 text-left">
                <label className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">
                  {t('voiceFinder.description')}
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full bg-black/40 border border-[#1F1F23] rounded-xl p-4 text-xs text-white placeholder-[#AEAEB2]/30 focus:border-[#D4AF37] transition resize-none focus:outline-none min-h-[90px]"
                  placeholder={t('voiceFinder.subtitle')}
                />
                
                {!isRecording && transcript.trim() && (
                  <button
                    onClick={handleSubmitAnalysis}
                    className="w-full py-3.5 mt-2 gold-bg-gradient text-black text-xs font-bold tracking-widest uppercase rounded-lg shadow-lg flex items-center justify-center space-x-1.5 transition shine-hover"
                  >
                    <span>{t('voiceFinder.analyzing')}</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs p-3 rounded-lg text-left">
                  {error}
                </div>
              )}

            </div>
          </div>
        )}

        {/* LOADING EXPERIENCE */}
        {loading && (
          <div className="glass-card p-10 md:p-16 rounded-2xl max-w-xl mx-auto w-full text-center space-y-10">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/10 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
              <div className="absolute inset-4 rounded-full bg-black/60 border border-[#D4AF37]/25 flex items-center justify-center">
                <Mic className="w-5 h-5 text-[#D4AF37] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="serif-title text-2xl font-semibold text-white">{t('voiceFinder.analyzing')}</h3>
              <p className="text-xs text-[#AEAEB2] tracking-wider uppercase">{t('voiceFinder.listening')}</p>
            </div>

            {/* Load steps list */}
            <div className="max-w-xs mx-auto text-left space-y-4 border-t border-[#1F1F23] pt-6">
              {[
                { label: t('voiceFinder.analyzing'), phase: 0 },
                { label: t('memoryFinder.loadingEmotions'), phase: 1 },
                { label: t('memoryFinder.loadingNotes'), phase: 2 },
                { label: t('memoryFinder.loadingMatches'), phase: 3 }
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

        {/* AI ANALYSIS OUTPUT */}
        {result && (
          <div className="space-y-12 animate-fadeIn">
            
            {/* Header Banner */}
            <div className="text-center max-w-xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-4.5 py-1.5 rounded-full text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">
                <span>{t('navbar.voiceFinder')}</span>
              </div>
              <h2 className="serif-title text-3xl sm:text-4xl md:text-5xl font-bold text-white">{t('voiceFinder.title')}</h2>
              <p className="text-xs text-[#AEAEB2] max-w-md mx-auto italic border-l-2 border-[#D4AF37] pl-3.5 py-0.5 text-left">
                &ldquo;{result.transcript}&rdquo;
              </p>
            </div>

            {/* Analysis Detail Box */}
            <div className="glass-card p-6 md:p-10 rounded-2xl space-y-8">
              
              {/* Voice breakdown stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                
                {/* Mood Badges */}
                <div className="space-y-2">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">{t('voiceFinder.mood')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.moods.map((mood) => (
                      <span
                        key={mood}
                        className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded"
                      >
                        {mood}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Occasion */}
                <div className="space-y-2">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">{t('voiceFinder.occasion')}</span>
                  <span className="block text-sm font-semibold text-white capitalize">{result.occasion}</span>
                </div>

                {/* Energy Level */}
                <div className="space-y-2">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">{t('voiceFinder.energy')}</span>
                  <span className="block text-sm font-semibold text-white capitalize">{result.energy}</span>
                </div>

                {/* Confidence Score progress bar */}
                <div className="space-y-2">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">{t('voiceFinder.confidence')}</span>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-full bg-[#1F1F23] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#D4AF37] h-full" style={{ width: `${result.confidence_score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[#D4AF37]">{result.confidence_score}%</span>
                  </div>
                </div>
              </div>

              {/* Scent notes & description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-[#D4AF37]/10 py-8">
                
                {/* AI Interpretation */}
                <div className="space-y-3">
                  <span className="block text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">{t('voiceFinder.description')}</span>
                  <p className="text-sm text-[#F5F5F7] leading-relaxed">
                    {result.description}
                  </p>
                </div>

                {/* Scent Notes badges */}
                <div className="space-y-3">
                  <span className="block text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold">{t('memoryFinder.suggestedNotes')}</span>
                  <div className="flex flex-wrap gap-2">
                    {result.notes.map((note) => (
                      <span
                        key={note}
                        className="bg-black/40 border border-[#1F1F23] text-white text-xs font-medium px-3.5 py-1.5 rounded-lg capitalize"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Poetic Description */}
              <div className="space-y-3">
                <span className="block text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">{t('perfumeCreator.story')}</span>
                <p className="serif-title text-lg md:text-xl text-[#F5F5F7] leading-relaxed font-normal italic">
                  &ldquo;{result.description}&rdquo;
                </p>
              </div>

            </div>

            {/* PRODUCT RECOMMENDATIONS */}
            <div className="space-y-8 pt-4">
              <div className="text-center space-y-2">
                <h3 className="serif-title text-2xl md:text-3xl font-bold text-white">{t('memoryFinder.recommendedPerfumes')}</h3>
                <p className="text-xs text-[#AEAEB2] tracking-wider uppercase">{t('home.productsSubtitle')}</p>
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
                      stock: 10
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
                          {prod.match_percentage}% {t('memoryFinder.matchPercent').toUpperCase()}
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

                          <p className="text-[11px] text-[#AEAEB2] mt-2 line-clamp-1">
                            Notes: {prod.notes}
                          </p>

                          <div className="flex items-center space-x-1.5 mt-2">
                            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                            <span className="text-white text-xs font-semibold">{prod.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Buy/View Product Buttons */}
                        <div className="flex flex-col space-y-2 mt-5 pt-3 border-t border-[#1F1F23]">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-extrabold tracking-wide text-sm">${prod.price.toFixed(2)}</span>
                            <button
                              onClick={handleAddToCart}
                              className="flex items-center space-x-1.5 bg-[#D4AF37] text-black px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-wider hover:bg-[#E5C158] transition uppercase"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>{t('products.addToCart')}</span>
                            </button>
                          </div>
                          
                          <Link 
                            href={`/products/${prod.id}`}
                            className="w-full text-center py-2 border border-white/10 hover:border-white/20 text-[#AEAEB2] hover:text-white rounded-lg text-[9px] font-bold tracking-widest uppercase transition"
                          >
                            {t('products.details')}
                          </Link>
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
                  <span>{t('perfumeCreator.btnReset')}</span>
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
