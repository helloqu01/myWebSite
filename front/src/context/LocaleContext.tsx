// src/context/LocaleContext.tsx
'use client'
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

export type Lang = 'en' | 'ko';
const LocaleContext = createContext<{ lang: Lang; setLang: (l: Lang)=>void }>({
  lang: 'en',
  setLang: () => {}
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'ko') {
      setLang(stored);
    }
  }, []);

  const updateLang = useCallback((next: Lang) => {
    setLang(next);
    localStorage.setItem('lang', next);
  }, []);
  return (
    <LocaleContext.Provider value={{ lang, setLang: updateLang }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
