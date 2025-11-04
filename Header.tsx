import React from 'react';
import { useLanguage } from '../LanguageContext';

const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="py-6 mb-4 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            {t('header_title')}
        </h1>
        <p className="text-slate-400 mt-2">{t('header_subtitle')}</p>
    </header>
  );
};

export default Header;
