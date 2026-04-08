import React from 'react';
import { Globe } from 'lucide-react';

const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
  it: 'Italian',
  ru: 'Russian',
  ar: 'Arabic',
  ko: 'Korean',
  hi: 'Hindi'
};

export default function TranslationNotificationBar({ originalLanguage, isIncoming = true }) {
  const langName = LANGUAGE_NAMES[originalLanguage] || originalLanguage;

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm">
      <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
      {isIncoming ? (
        <p className="text-blue-800">
          <span className="font-semibold">Language detected:</span> This person is writing in{' '}
          <span className="font-semibold">{langName}</span>. Messages have been automatically
          translated by AI for your convenience. Your replies will also be translated back to{' '}
          {langName} before they receive them.
        </p>
      ) : (
        <p className="text-blue-800">
          <span className="font-semibold">Auto-translation active:</span> Your message will be
          automatically translated from English to{' '}
          <span className="font-semibold">{langName}</span> before it reaches this person.
        </p>
      )}
    </div>
  );
}