'use client';

import { useI18nStore, Language } from '../store/useI18nStore';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ml', name: 'മലയാളം' }
];

export function LanguageSwitcher() {
  const { lang, setLanguage } = useI18nStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangName = languages.find(l => l.code === lang)?.name || 'English';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 bg-[#1F1F23]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] border border-[#1F1F23] hover:border-[#D4AF37]/35 rounded-full px-3 py-1.5 transition text-xs text-[#AEAEB2] cursor-pointer focus:outline-none"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentLangName}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#111115] border border-[#1F1F23] shadow-2xl z-50 overflow-hidden py-1">
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => {
                setLanguage(language.code as Language);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs transition duration-150 flex items-center justify-between cursor-pointer ${
                lang === language.code
                  ? 'text-[#D4AF37] bg-[#D4AF37]/10 font-semibold'
                  : 'text-[#AEAEB2] hover:text-white hover:bg-[#1F1F23]/60'
              }`}
            >
              <span>{language.name}</span>
              {lang === language.code && <span className="text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
