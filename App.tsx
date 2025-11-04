import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Transaction, TransactionType, CustomCategory } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import LanguageSwitcher from './components/LanguageSwitcher';
import { PlusIcon } from './components/icons/PlusIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { useLanguage } from './LanguageContext';
import { useNotification } from './NotificationContext';
import ExpenseChart from './components/ExpenseChart';
import UpcomingBills from './components/UpcomingBills';
import ChatAssistant from './components/ChatAssistant';
import ManageCategoriesModal from './components/ManageCategoriesModal';
import { CATEGORY_MAP, CATEGORY_KEYS, CATEGORY_COLORS, CategoryKey } from './constants';
import * as api from './services/api';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const { t, locale } = useLanguage();
  const { showNotification } = useNotification();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [transactionsData, categoriesData] = await Promise.all([
            api.fetchTransactions(),
            api.fetchCustomCategories(),
        ]);
        setTransactions(transactionsData);
        setCustomCategories(categoriesData);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch data";
        showNotification(errorMessage, 'error');
    } finally {
        setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { allCategoriesMap, allCategoryKeys } = useMemo(() => {
    const map: { [key: string]: { name: string; color: string } } = {};
    CATEGORY_KEYS.forEach(key => {
        map[key] = {
            name: CATEGORY_MAP[key as CategoryKey][locale] || CATEGORY_MAP[key as CategoryKey]['en-US'],
            color: CATEGORY_COLORS[key as CategoryKey],
        };
    });
    customCategories.forEach(cat => {
        map[cat.key] = {
            name: cat.name,
            color: cat.color,
        };
    });
    return { allCategoriesMap: map, allCategoryKeys: Object.keys(map) };
  }, [customCategories, locale]);

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
  }, [transactions]);

  const handleOpenModal = useCallback(() => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const handleSaveTransaction = useCallback(async (transaction: Omit<Transaction, 'id'> & { id?: string }) => {
    try {
        const savedTransaction = await api.saveTransaction(transaction);
        if (transaction.id) {
            setTransactions(prev => prev.map(t => t.id === savedTransaction.id ? savedTransaction : t));
            showNotification(t('transaction_updated_success'), 'success');
        } else {
            setTransactions(prev => [...prev, savedTransaction]);
            showNotification(t('transaction_added_success'), 'success');
        }
        handleCloseModal();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save transaction";
        showNotification(errorMessage, 'error');
    }
  }, [handleCloseModal, showNotification, t]);

  const handleEditTransaction = useCallback((id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setEditingTransaction(transaction);
      setIsModalOpen(true);
    }
  }, [transactions]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    try {
        await api.deleteTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
        showNotification(t('transaction_deleted_success'), 'success');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete transaction";
        showNotification(errorMessage, 'error');
    }
  }, [showNotification, t]);
  
  const handleTogglePaidStatus = useCallback(async (id: string) => {
    try {
        const updatedTransaction = await api.toggleTransactionPaidStatus(id);
        setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update bill status";
        showNotification(errorMessage, 'error');
    }
  }, [showNotification]);

  const handleAddCategory = useCallback(async (category: Omit<CustomCategory, 'key'>) => {
    try {
        const newCategory = await api.addCustomCategory(category);
        setCustomCategories(prev => [...prev, newCategory]);
        showNotification(t('category_added_success'), 'success');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to add category";
        showNotification(errorMessage, 'error');
    }
  }, [showNotification, t]);

  const handleDeleteCategory = useCallback(async (key: string) => {
    try {
        await api.deleteCustomCategory(key);
        setCustomCategories(prev => prev.filter(cat => cat.key !== key));
        showNotification(t('category_deleted_success'), 'success');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('category_in_use_error');
        showNotification(errorMessage, 'error');
    }
  }, [showNotification, t]);

  if (isLoading) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <Spinner className="h-16 w-16 text-indigo-400" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="container mx-auto max-w-2xl p-4">
        <Header />
        <main>
          <Dashboard totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} />
          <UpcomingBills transactions={transactions} onTogglePaidStatus={handleTogglePaidStatus} allCategoriesMap={allCategoriesMap} />
          <ExpenseChart transactions={transactions} allCategoriesMap={allCategoriesMap} />
          <TransactionList 
            transactions={transactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
            allCategoriesMap={allCategoriesMap}
          />
        </main>
      </div>
      
      {isModalOpen && (
        <TransactionForm
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTransaction}
          transaction={editingTransaction}
          allCategoriesMap={allCategoriesMap}
          allCategoryKeys={allCategoryKeys}
          customCategories={customCategories}
        />
      )}

      {isChatOpen && (
        <ChatAssistant
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          transactions={transactions}
        />
      )}

      {isCategoryModalOpen && (
        <ManageCategoriesModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          customCategories={customCategories}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      <LanguageSwitcher />
      
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 left-6 bg-slate-700 hover:bg-slate-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
        aria-label={t('chat_aria')}
      >
        <SparklesIcon className="h-8 w-8" />
      </button>

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
