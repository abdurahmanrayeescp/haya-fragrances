'use client';

import { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProductCard, Product } from '../../components/ProductCard';
import { Sparkles, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

export default function AIRecommendPage() {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('Unisex');
  const [occasion, setOccasion] = useState('Daily');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [strength, setStrength] = useState('Moderate');

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const notesList = ['Woody', 'Floral', 'Citrus', 'Oriental', 'Fresh', 'Spicy', 'Fruity', 'Vanilla'];

  const toggleNote = (note: string) => {
    if (selectedNotes.includes(note)) {
      setSelectedNotes(selectedNotes.filter((n) => n !== note));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    setQuizCompleted(true);
    try {
      const response = await api.post('/ai/recommend', {
        gender,
        occasion,
        preferred_notes: selectedNotes.length > 0 ? selectedNotes : ['Woody'],
        strength
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to load fragrance recommendations', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setStep(1);
    setGender('Unisex');
    setOccasion('Daily');
    setSelectedNotes([]);
    setStrength('Moderate');
    setRecommendations([]);
    setQuizCompleted(false);
  };

  return (
    <div className="bg-[#0B0B0B] text-[#F5F5F7] min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-28 flex flex-col justify-center">
        {/* Header */}
        {!quizCompleted && (
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-4.5 py-1.5 rounded-full text-[10px] tracking-widest text-[#D4AF37] uppercase font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>AI SCENT CONSULTANT</span>
            </div>
            <h1 className="serif-title text-3xl sm:text-4xl md:text-5xl font-bold text-white">Fragrance Finder</h1>
            <p className="text-xs sm:text-sm text-[#AEAEB2] leading-relaxed">
              Answer 4 simple profile questions to match your personality against our luxury olfactory database.
            </p>
          </div>
        )}

        {/* Wizard Panel */}
        {!quizCompleted ? (
          <div className="glass-card p-8 md:p-12 rounded-2xl max-w-2xl mx-auto w-full relative">
            {/* Step indicators */}
            <div className="flex justify-between items-center text-[10px] tracking-widest text-[#AEAEB2] uppercase font-bold mb-8">
              <span>QUESTION {step} OF 4</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className={`w-6 h-1 rounded ${s <= step ? 'bg-[#D4AF37]' : 'bg-[#1F1F23]'}`} />
                ))}
              </div>
            </div>

            {/* Questions routing */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="serif-title text-xl md:text-2xl font-bold text-white">What is your gender preference?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold tracking-widest">
                  {['Men', 'Women', 'Unisex'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`p-6 rounded-xl border text-center transition ${gender === g ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]' : 'border-[#1F1F23] bg-black/40 hover:border-white/25 text-white'}`}
                    >
                      {g.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="serif-title text-xl md:text-2xl font-bold text-white">Select preferred olfactory notes:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
                  {notesList.map((n) => {
                    const isSel = selectedNotes.includes(n);
                    return (
                      <button
                        key={n}
                        onClick={() => toggleNote(n)}
                        className={`p-4 rounded-xl border text-center transition tracking-wider ${isSel ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]' : 'border-[#1F1F23] bg-black/40 hover:border-white/25 text-white'}`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="serif-title text-xl md:text-2xl font-bold text-white">For which occasions do you wear it?</h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold tracking-widest">
                  {['Daily', 'Night Out', 'Formal', 'Sport'].map((o) => (
                    <button
                      key={o}
                      onClick={() => setOccasion(o)}
                      className={`p-5 rounded-xl border text-center transition ${occasion === o ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]' : 'border-[#1F1F23] bg-black/40 hover:border-white/25 text-white'}`}
                    >
                      {o.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="serif-title text-xl md:text-2xl font-bold text-white">What is your sillage/strength preference?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold tracking-widest">
                  {['Subtle', 'Moderate', 'Intense'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStrength(st)}
                      className={`p-6 rounded-xl border text-center transition ${strength === st ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]' : 'border-[#1F1F23] bg-black/40 hover:border-white/25 text-white'}`}
                    >
                      {st.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nav controls */}
            <div className="flex items-center justify-between border-t border-[#1F1F23] pt-8 mt-10">
              {step > 1 ? (
                <button
                  onClick={handlePrev}
                  className="flex items-center space-x-1.5 text-xs font-bold tracking-widest text-[#AEAEB2] hover:text-white uppercase"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>
              ) : (
                <div />
              )}
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold tracking-widest uppercase rounded flex items-center space-x-1.5 transition"
                >
                  <span>NEXT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold tracking-widest uppercase rounded flex items-center space-x-1.5 transition shadow-lg shadow-[#D4AF37]/15"
                >
                  <span>FIND MY FRAGRANCE</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          // Recommendations Results panel
          <div className="space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#D4AF37] mx-auto animate-pulse" />
              <h2 className="serif-title text-3xl md:text-4xl font-bold text-white">Your Perfume Matches</h2>
              <p className="text-xs text-[#AEAEB2] tracking-widest uppercase">
                ANALYSIS COMPLETE • SELECTED NOTES: {selectedNotes.join(', ')}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="glass-card rounded-lg h-[420px] p-5 space-y-4 animate-pulse">
                    <div className="bg-white/5 h-64 w-full rounded" />
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-6 bg-white/10 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="glass-card p-10 rounded-2xl text-center space-y-4 max-w-md mx-auto">
                <p className="text-sm text-[#AEAEB2] font-semibold">No exact matches found in our premium reserves.</p>
                <button onClick={resetQuiz} className="bg-[#D4AF37] text-black px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest">
                  TRY AGAIN
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {recommendations.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>

                <div className="flex justify-center pt-6">
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-3 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] font-semibold rounded text-xs tracking-widest uppercase flex items-center space-x-2 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>RETAKE FRAGRANCE QUIZ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
