import { create } from 'zustand';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import hi from '../locales/hi.json';
import ml from '../locales/ml.json';

export type Language = 'en' | 'ar' | 'hi' | 'ml';

const translations: Record<Language, any> = { en, ar, hi, ml };

interface I18nState {
  lang: Language;
  isHydrated: boolean;
  setLanguage: (lang: Language) => void;
  setHydrated: () => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  lang: 'en',
  isHydrated: false,
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
    set({ lang });
  },
  setHydrated: () => set({ isHydrated: true }),
}));

export function useTranslation() {
  const { lang, setLanguage, isHydrated } = useI18nStore();

  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    let result: any = translations[lang] || en;
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        // Fallback to English
        let enResult: any = en;
        for (const enKey of keys) {
          if (enResult && typeof enResult === 'object' && enKey in enResult) {
            enResult = enResult[enKey];
          } else {
            enResult = null;
            break;
          }
        }
        return enResult || fallback || keyPath;
      }
    }
    
    return typeof result === 'string' ? result : (fallback || keyPath);
  };

  return { t, lang, setLanguage, isHydrated };
}
