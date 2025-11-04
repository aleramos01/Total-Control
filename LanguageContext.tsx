import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { translations, Locale, AllTranslations } from './locales';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof AllTranslations['en-US']) => string;
  formatCurrency: (value: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLocale = (): Locale => {
  try {
    const savedLocale = localStorage.getItem('app-locale');
    if (savedLocale && Object.keys(translations).includes(savedLocale)) {
      return savedLocale as Locale;
    }
  } catch (error) {
    console.error("Failed to get locale from localStorage", error);
  }
  return 'pt-BR';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    try {
      localStorage.setItem('app-locale', newLocale);
      setLocaleState(newLocale);
    } catch (error) {
      console.error("Failed to save locale to localStorage", error);
    }
  }, []);

  const t = useCallback((key: keyof AllTranslations['en-US']) => {
    return translations[locale][key] || translations['en-US'][key];
  }, [locale]);

  const formatCurrency = useCallback((value: number) => {
    const options: Intl.NumberFormatOptions = { style: 'currency', currency: 'BRL' };
    switch (locale) {
      case 'en-US':
        options.currency = 'USD';
        break;
      case 'zh-CN':
        options.currency = 'CNY';
        break;
      case 'ru-RU':
        options.currency = 'RUB';
        break;
      case 'pt-BR':
      default:
        options.currency = 'BRL';
        break;
    }
    return value.toLocaleString(locale, options);
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale,
    t,
    formatCurrency,
  }), [locale, setLocale, t, formatCurrency]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};