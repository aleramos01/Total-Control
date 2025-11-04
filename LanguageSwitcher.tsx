
import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { GlobeIcon } from './icons/GlobeIcon';
import { BrazilFlagIcon } from './icons/BrazilFlagIcon';
import { UsaFlagIcon } from './icons/UsaFlagIcon';
import { ChinaFlagIcon } from './icons/ChinaFlagIcon';
import { RussiaFlagIcon } from './icons/RussiaFlagIcon';
import { Locale } from '../locales';

const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale } = useLanguage();

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  const languages: { code: Locale, Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { code: 'pt-BR', Icon: BrazilFlagIcon },
    { code: 'en-US', Icon: UsaFlagIcon },
    { code: 'zh-CN', Icon: ChinaFlagIcon },
    { code: 'ru-RU', Icon: RussiaFlagIcon },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative flex flex-col items-center">
        {isOpen && (
          <div className="flex flex-col items-center gap-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full p-3 mb-3">
            {languages.filter(lang => lang.code !== locale).map(({code, Icon}) => (
                <button
                    key={code}
                    onClick={() => handleSetLocale(code)}
                    className="rounded-full overflow-hidden w-10 h-10 transition-transform transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                    aria-label={`Switch to ${code}`}
                >
                    <Icon className="w-full h-full" />
                </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-700 hover:bg-slate-600 text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
          aria-label="Change language"
        >
          {isOpen ? <GlobeIcon className="h-8 w-8 animate-pulse" /> : <GlobeIcon className="h-8 w-8" />}
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
