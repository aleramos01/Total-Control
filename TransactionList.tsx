
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { useLanguage } from '../LanguageContext';
import { ExportIcon } from './icons/ExportIcon';
import ConfirmationDialog from './ConfirmationDialog';
import { CogIcon } from './icons/CogIcon';
import TransactionGroup from './TransactionGroup';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenCategoryModal: () => void;
  allCategoriesMap: { [key: string]: { name: string; color: string } };
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete, onOpenCategoryModal, allCategoriesMap }) => {
  const { t } = useLanguage();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const handleDeleteRequest = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setTransactionToDelete(transaction);
    }
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setTransactionToDelete(null);
  };
  
  const groupedTransactions = useMemo(() => {
    const groups: { [key in TransactionType]: { [category: string]: Transaction[] } } = {
      [TransactionType.INCOME]: {},
      [TransactionType.EXPENSE]: {},
    };

    [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(transaction => {
        const type = transaction.type;
        const category = transaction.category;
        if (!groups[type][category]) {
          groups[type][category] = [];
        }
        groups[type][category].push(transaction);
      });
      
    for (const type in groups) {
        const typedGroups = groups[type as TransactionType];
        const sortedCategories = Object.keys(typedGroups).sort((a, b) => {
            const totalA = typedGroups[a].reduce((sum, tx) => sum + tx.amount, 0);
            const totalB = typedGroups[b].reduce((sum, tx) => sum + tx.amount, 0);
            return totalB - totalA;
        });
        
        const sortedGroups: { [category: string]: Transaction[] } = {};
        sortedCategories.forEach(category => {
            sortedGroups[category] = typedGroups[category];
        });
        groups[type as TransactionType] = sortedGroups;
    }

    return groups;
  }, [transactions]);

  const incomeGroups = groupedTransactions[TransactionType.INCOME];
  const expenseGroups = groupedTransactions[TransactionType.EXPENSE];

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      return;
    }
  
    const escapeCsvCell = (cell: any): string => {
      let cellString = String(cell);
      if (cellString.search(/("|,|\n)/g) >= 0) {
        cellString = '"' + cellString.replace(/"/g, '""') + '"';
      }
      return cellString;
    };
  
    const headers = [
      t('csv_id'),
      t('csv_description'),
      t('csv_amount'),
      t('csv_date'),
      t('csv_type'),
      t('csv_category'),
      t('csv_is_recurring'),
      t('csv_due_date'),
    ];
  
    const rows = transactions.map(tx => [
      tx.id,
      tx.description,
      tx.amount,
      new Date(tx.date).toISOString().split('T')[0],
      tx.type,
      allCategoriesMap[tx.category]?.name || tx.category,
      tx.isRecurring ? 'Yes' : 'No',
      tx.dueDate ? new Date(tx.dueDate).toISOString().split('T')[0] : '',
    ].map(escapeCsvCell).join(','));
  
    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-300">{t('transactions')}</h2>
            <button
                onClick={onOpenCategoryModal}
                className="text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label={t('manage_categories')}
            >
                <CogIcon className="h-6 w-6" />
            </button>
        </div>
        {transactions.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
            aria-label={t('export_csv')}
          >
            <ExportIcon className="h-4 w-4" />
            <span>{t('export_csv')}</span>
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-400">{t('no_transactions')}</p>
          <p className="text-slate-500 text-sm mt-2">{t('add_first_transaction')}</p>
        </div>
      ) : (
        <div className="space-y-4">
            {Object.keys(incomeGroups).length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-slate-400 mb-2 px-2">{t('incomes')}</h3>
                    <div className="space-y-3">
                        {Object.entries(incomeGroups).map(([category, transactions]) => (
                            <TransactionGroup
                                key={`income-${category}`}
                                categoryKey={category}
                                transactions={transactions}
                                onEdit={onEdit}
                                onDelete={handleDeleteRequest}
                                allCategoriesMap={allCategoriesMap}
                            />
                        ))}
                    </div>
                </div>
            )}
            {Object.keys(expenseGroups).length > 0 && (
                 <div>
                    <h3 className="text-xl font-semibold text-slate-400 mb-2 px-2">{t('expenses')}</h3>
                    <div className="space-y-3">
                        {Object.entries(expenseGroups).map(([category, transactions]) => (
                            <TransactionGroup
                                key={`expense-${category}`}
                                categoryKey={category}
                                transactions={transactions}
                                onEdit={onEdit}
                                onDelete={handleDeleteRequest}
                                allCategoriesMap={allCategoriesMap}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}

      {transactionToDelete && (
        <ConfirmationDialog
          isOpen={!!transactionToDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={t('confirm_delete_title')}
          message={t('confirm_delete_message').replace('{description}', transactionToDelete.description)}
          confirmButtonText={t('delete_button')}
          confirmButtonVariant="danger"
        />
      )}
    </div>
  );
};

export default TransactionList;