import React from 'react';
import { Transaction, TransactionType } from '../types';
import { useLanguage } from '../LanguageContext';
import { CalendarIcon } from './icons/CalendarIcon';
import { CheckIcon } from './icons/CheckIcon';
import ConfirmationDialog from './ConfirmationDialog';

interface UpcomingBillsProps {
  transactions: Transaction[];
  onTogglePaidStatus: (id: string) => void;
  allCategoriesMap: { [key: string]: { name: string; color: string } };
}

const UpcomingBills: React.FC<UpcomingBillsProps> = ({ transactions, onTogglePaidStatus, allCategoriesMap }) => {
  const { t, formatCurrency } = useLanguage();
  const [billToToggle, setBillToToggle] = React.useState<Transaction | null>(null);

  const handleToggleRequest = (bill: Transaction) => {
    setBillToToggle(bill);
  };

  const handleConfirmToggle = () => {
    if (billToToggle) {
      onTogglePaidStatus(billToToggle.id);
      setBillToToggle(null);
    }
  };

  const handleCancelToggle = () => {
    setBillToToggle(null);
  };

  const upcomingBills = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    return transactions
      .filter(tx => tx.isRecurring && tx.type === TransactionType.EXPENSE && tx.dueDate)
      .map(tx => {
        const dueDate = new Date(tx.dueDate!);
        const userTimezoneOffset = dueDate.getTimezoneOffset() * 60000;
        const normalizedDueDate = new Date(dueDate.getTime() + userTimezoneOffset);
        
        const diffTime = normalizedDueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...tx, diffDays };
      })
      .filter(tx => tx.diffDays <= 30)
      .sort((a, b) => {
        if (a.isPaid && !b.isPaid) return 1;
        if (!a.isPaid && b.isPaid) return -1;
        return a.diffDays - b.diffDays
      });
  }, [transactions]);

  const getDueDateStatus = (diffDays: number) => {
    if (diffDays < 0) {
      return { text: t('overdue_by_days').replace('{days}', String(Math.abs(diffDays))), color: 'text-red-400' };
    }
    if (diffDays === 0) {
      return { text: t('due_today'), color: 'text-orange-400' };
    }
    return { text: t('due_in_days').replace('{days}', String(diffDays)), color: 'text-cyan-400' };
  };

  return (
    <>
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-300 mb-4">{t('upcoming_bills')}</h2>
        <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-xl border border-slate-700">
          {upcomingBills.length === 0 ? (
            <div className="text-center py-4">
              <CalendarIcon className="h-12 w-12 mx-auto text-slate-500" />
              <p className="mt-3 text-slate-400">{t('no_upcoming_bills')}</p>
              <p className="text-slate-500 text-sm">{t('all_caught_up')}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcomingBills.map(bill => {
                const { text, color } = getDueDateStatus(bill.diffDays);
                const isPaid = bill.isPaid;
                return (
                  <li key={bill.id} className={`flex items-center gap-4 p-2 bg-slate-800 rounded-lg transition-opacity ${isPaid ? 'opacity-50' : ''}`}>
                    <div 
                      className="w-2 h-10 rounded" 
                      style={{ backgroundColor: allCategoriesMap[bill.category]?.color || '#6B7280' }}
                    ></div>
                    <div className="flex-1">
                      <p className={`font-semibold text-slate-200 ${isPaid ? 'line-through' : ''}`}>{bill.description}</p>
                      <p className="text-sm text-slate-400">{allCategoriesMap[bill.category]?.name || bill.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg text-slate-200 ${isPaid ? 'line-through' : ''}`}>{formatCurrency(bill.amount)}</p>
                      {isPaid ? (
                          <p className="text-sm font-medium text-green-400">{t('paid')}</p>
                      ) : (
                          <p className={`text-sm font-medium ${color}`}>{text}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleRequest(bill)}
                      className={`p-2 rounded-full transition-colors ${isPaid ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                      aria-label={isPaid ? t('mark_as_unpaid') : t('mark_as_paid')}
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      {billToToggle && (
        <ConfirmationDialog
            isOpen={!!billToToggle}
            onClose={handleCancelToggle}
            onConfirm={handleConfirmToggle}
            title={t('confirm_payment_toggle_title')}
            message={
                billToToggle.isPaid
                ? t('confirm_mark_as_unpaid_message').replace('{description}', billToToggle.description)
                : t('confirm_mark_as_paid_message').replace('{description}', billToToggle.description)
            }
            confirmButtonText={t('confirm_button')}
            confirmButtonVariant="primary"
        />
      )}
    </>
  );
};

export default UpcomingBills;
