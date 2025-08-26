
import React from 'react';
import { Transaction } from '../types';
import TransactionItem from './TransactionItem';
import { useLanguage } from '../LanguageContext';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete }) => {
  const { t } = useLanguage();
  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
        <p className="text-slate-400">{t('no_transactions')}</p>
        <p className="text-slate-500 text-sm mt-2">{t('add_first_transaction')}</p>
      </div>
    );
  }

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-3">
      {sortedTransactions.map(transaction => (
        <TransactionItem 
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TransactionList;
