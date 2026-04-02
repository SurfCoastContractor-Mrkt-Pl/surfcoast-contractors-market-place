import React, { useState, useEffect } from 'react';
import { supportedLanguages } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ onLanguageChange }) {
  const [language, setLanguage] = useState(() => {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem('language') || 'en'
      : 'en';
  });

  const handleChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    onLanguageChange?.(newLang);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <select
        value={language}
        onChange={(e) => handleChange(e.target.value)}
        className="px-2 py-1 border border-gray-300 rounded text-sm"
      >
        {Object.entries(supportedLanguages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}