
import React, { useState, useMemo, useCallback } from 'react';
import { Transaction, TransactionType } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import LanguageSwitcher from './components/LanguageSwitcher';
import { PlusIcon } from './components/icons/PlusIcon';
import { useLanguage } from './LanguageContext';
import { useNotification } from './NotificationContext';

const App: React.FC = () => {
  const { t } = useLanguage();
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', description: 'Salário Mensal', amount: 5000, date: new Date().toISOString(), type: TransactionType.INCOME, category: 'salary' },
    { id: '2', description: 'Aluguel', amount: 1500, date: new Date().toISOString(), type: TransactionType.EXPENSE, category: 'housing' },
    { id: '3', description: 'Supermercado', amount: 450, date: new Date().toISOString(), type: TransactionType.EXPENSE, category: 'food' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const handleOpenModal = useCallback(() => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const handleSaveTransaction = useCallback((transaction: Omit<Transaction, 'id'> & { id?: string }) => {
    if (transaction.id) {
      // Update
      setTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, ...transaction } as Transaction : t));
      showNotification(t('transaction_updated_success'), 'success');
    } else {
      // Create
      setTransactions(prev => [...prev, { ...transaction, id: new Date().getTime().toString() } as Transaction]);
      showNotification(t('transaction_added_success'), 'success');
    }
    handleCloseModal();
  }, [handleCloseModal, showNotification, t]);

  const handleEditTransaction = useCallback((id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setEditingTransaction(transaction);
      setIsModalOpen(true);
    }
  }, [transactions]);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showNotification(t('transaction_deleted_success'), 'success');
  }, [showNotification, t]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="container mx-auto max-w-2xl p-4">
        <Header />
        <main>
          <Dashboard totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} />
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-300 mb-4">{t('transactions')}</h2>
            <TransactionList 
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </main>
      </div>
      
      {isModalOpen && (
        <TransactionForm
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTransaction}
          transaction={editingTransaction}
        />
      )}

      <LanguageSwitcher />

      <button
        onClick={handleOpenModal}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
        aria-label={t('add_transaction_aria')}
      >
        <PlusIcon className="h-8 w-8" />
      </button>
    </div>
  );
};

export default App;