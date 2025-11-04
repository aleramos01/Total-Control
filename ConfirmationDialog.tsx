import React from 'react';
import { useLanguage } from '../LanguageContext';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText: string;
  confirmButtonVariant?: 'danger' | 'primary';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  confirmButtonVariant = 'primary',
}) => {
  const { t } = useLanguage();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const confirmButtonClasses = confirmButtonVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-indigo-600 hover:bg-indigo-700';

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirmation-dialog-title" className="text-2xl font-bold mb-4 text-slate-100">{title}</h2>
        <p className="text-slate-400 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md transition">{t('cancel')}</button>
          <button type="button" onClick={onConfirm} className={`py-2 px-4 text-white rounded-md transition ${confirmButtonClasses}`}>{confirmButtonText}</button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationDialog;
