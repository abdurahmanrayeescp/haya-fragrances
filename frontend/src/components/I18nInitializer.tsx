'use client';

import { useEffect } from 'react';
import { useI18nStore, Language } from '../store/useI18nStore';

export function I18nInitializer() {
  useEffect(() => {
    const saved = localStorage.getItem('lang') as Language;
    if (saved && ['en', 'ar', 'hi', 'ml'].includes(saved)) {
      useI18nStore.getState().setLanguage(saved);
    } else {
      // Default to English and LTR
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
    useI18nStore.getState().setHydrated();
  }, []);

  return null;
}
