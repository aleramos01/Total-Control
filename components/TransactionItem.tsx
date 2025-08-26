
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { useLanguage } from '../LanguageContext';
import { CATEGORY_MAP } from '../constants';


interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete }) => {
  const { locale, t } = useLanguage();

  const isIncome = transaction.type === TransactionType.INCOME;
  const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
  const Icon = isIncome ? ArrowUpIcon : ArrowDownIcon;
  const iconBgColor = isIncome ? 'bg-green-500/10' : 'bg-red-500/10';

  const formatCurrency = (value: number) => {
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
  };

  const formattedAmount = formatCurrency(transaction.amount);
  const formattedDate = new Date(transaction.date).toLocaleDateString(locale);
  const categoryName = CATEGORY_MAP[transaction.category][locale] || CATEGORY_MAP[transaction.category]['en-US'];

  return (
    <div className="group bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center space-x-4 transition-all hover:bg-slate-800 hover:border-indigo-600">
      <div className={`p-3 rounded-full ${iconBgColor}`}>
        <Icon className={`h-5 w-5 ${amountColor}`} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-200">{transaction.description}</p>
        <p className="text-sm text-slate-400">{categoryName} - {formattedDate}</p>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg ${amountColor}`}>{isIncome ? `+ ${formattedAmount}` : `- ${formattedAmount}`}</p>
      </div>
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(transaction.id)} className="p-2 text-slate-400 hover:text-cyan-400" aria-label={t('edit_aria')}>
          <PencilIcon className="h-5 w-5" />
        </button>
        <button onClick={() => onDelete(transaction.id)} className="p-2 text-slate-400 hover:text-red-400" aria-label={t('delete_aria')}>
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;
