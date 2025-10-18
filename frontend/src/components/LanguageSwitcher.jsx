import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
      title={language === 'cs' ? 'Switch to English' : 'Přepnout na češtinu'}
    >
      <Languages className="w-4 h-4 text-slate-400" />
      <span className="text-sm font-medium text-slate-300">
        {language.toUpperCase()}
      </span>
    </button>
  );
}
