
import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionType } from '../types';
import { CATEGORY_MAP, CATEGORY_KEYS, CategoryKey } from '../constants';
import { categorizeTransaction } from '../services/geminiService';
import Spinner from './Spinner';
import { useLanguage } from '../LanguageContext';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  transaction: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose, onSave, transaction }) => {
  const { t, locale } = useLanguage();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<CategoryKey>('other');
  const [isCategorizing, setIsCategorizing] = useState(false);

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setType(transaction.type);
      setCategory(transaction.category);
    } else {
      // Reset form
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setType(TransactionType.EXPENSE);
      setCategory('other');
    }
  }, [transaction, isOpen]);

  const handleDescriptionBlur = useCallback(async () => {
    if (description.trim().length > 3) {
      setIsCategorizing(true);
      try {
        const suggestedCategoryKey = await categorizeTransaction(description, locale);
        if (suggestedCategoryKey) {
            setCategory(suggestedCategoryKey);
        }
      } catch (error) {
        console.error("Error categorizing transaction:", error);
      } finally {
        setIsCategorizing(false);
      }
    }
  }, [description, locale]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onSave({
      id: transaction?.id,
      description,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      type,
      category,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-slate-100">{transaction ? t('edit_transaction') : t('new_transaction')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-400">{t('description')}</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-400">{t('amount')}</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-400">{t('date')}</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">{t('type')}</label>
            <div className="mt-1 grid grid-cols-2 gap-2 rounded-lg bg-slate-700 p-1">
              <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-full rounded-md py-2 text-sm font-medium ${type === TransactionType.INCOME ? 'bg-green-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>{t('income')}</button>
              <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-full rounded-md py-2 text-sm font-medium ${type === TransactionType.EXPENSE ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>{t('expense')}</button>
            </div>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-400">{t('category')}</label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryKey)}
                className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {CATEGORY_KEYS.map(catKey => <option key={catKey} value={catKey}>{CATEGORY_MAP[catKey][locale]}</option>)}
              </select>
              {isCategorizing && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />}
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md transition">{t('cancel')}</button>
            <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition">{t('save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
