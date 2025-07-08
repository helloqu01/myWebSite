// src/context/LocaleContext.tsx
'use client'
import React, { createContext, useState, useContext } from 'react';

export type Lang = 'en' | 'ko';
const LocaleContext = createContext<{ lang: Lang; setLang: (l: Lang)=>void }>({
  lang: 'en',
  setLang: () => {}
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  return (
    <LocaleContext.Provider value={{ lang, setLang }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
