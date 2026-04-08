import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese (Português)', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese (中文)', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian (Русский)', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦' }
];

export default function LanguagePreferenceSelector({ onSelect, defaultLanguage = 'en' }) {
  const [selected, setSelected] = useState(defaultLanguage);

  const handleSelect = (code) => {
    setSelected(code);
    onSelect(code);
  };

  const selectedLang = LANGUAGES.find(l => l.code === selected);

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Language Preference
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2 font-normal">
          Select your preferred language. You can change this anytime in your settings.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selected} onValueChange={handleSelect}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="p-3 bg-white rounded-lg border border-blue-100">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-semibold">Smart Translation</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            If you send messages in a different language, our AI will automatically detect it and translate your messages before sending them to contractors who speak a different language. They'll receive a notification letting them know a translation is being used.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}