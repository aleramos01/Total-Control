import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import TransactionItem from './TransactionItem';
import { useLanguage } from '../LanguageContext';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface TransactionGroupProps {
  categoryKey: string;
  transactions: Transaction[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  allCategoriesMap: { [key: string]: { name: string; color: string } };
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({ categoryKey, transactions, onEdit, onDelete, allCategoriesMap }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, formatCurrency } = useLanguage();

  if (transactions.length === 0) {
    return null;
  }

  const { name, color } = allCategoriesMap[categoryKey] || { name: categoryKey, color: '#6B7280' };
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const transactionType = transactions[0].type;
  const isIncome = transactionType === TransactionType.INCOME;
  const amountColor = isIncome ? 'text-green-400' : 'text-red-400';

  const transactionCountText = transactions.length === 1 
    ? t('transaction_count_one').replace('{count}', '1')
    : t('transaction_count_other').replace('{count}', String(transactions.length));

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-slate-800"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-10 rounded" style={{ backgroundColor: color }}></div>
          <div>
            <p className="font-bold text-lg text-slate-200">{name}</p>
            <p className="text-sm text-slate-400">{transactionCountText}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className={`font-bold text-lg ${amountColor}`}>
            {isIncome ? `+ ${formatCurrency(totalAmount)}` : `- ${formatCurrency(totalAmount)}`}
          </p>
          <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-2 space-y-2">
          {transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
                allCategoriesMap={allCategoriesMap}
                isGrouped={true}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default TransactionGroup;
