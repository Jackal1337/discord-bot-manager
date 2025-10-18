import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Načíst jazyk z localStorage nebo defaultně 'cs'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'cs';
  });

  // Uložit jazyk do localStorage při změně
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Funkce pro přepnutí jazyka
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'cs' ? 'en' : 'cs');
  };

  // Funkce pro získání překladu
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
