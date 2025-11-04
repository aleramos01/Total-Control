import React from 'react';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { useLanguage } from '../LanguageContext';

interface DashboardProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

const Dashboard: React.FC<DashboardProps> = ({ totalIncome, totalExpenses, balance }) => {
  const { t, formatCurrency } = useLanguage();

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-xl border border-slate-700 flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-sm">{t('income')}</span>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-green-500/10 p-3 rounded-full">
            <ArrowUpIcon className="h-6 w-6 text-green-400" />
        </div>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-xl border border-slate-700 flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-sm">{t('expenses')}</span>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-red-500/10 p-3 rounded-full">
            <ArrowDownIcon className="h-6 w-6 text-red-400" />
        </div>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-xl border border-slate-700 col-span-1 md:col-span-3">
        <span className="text-slate-400 text-sm">{t('balance')}</span>
        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </section>
  );
};

export default Dashboard;