import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { CustomCategory } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  customCategories: CustomCategory[];
  onAddCategory: (category: Omit<CustomCategory, 'key'>) => void;
  onDeleteCategory: (key: string) => void;
}

const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  customCategories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [color, setColor] = useState(generateRandomColor());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddCategory({ name: name.trim(), color });
      setName('');
      setColor(generateRandomColor());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-slate-100">{t('manage_categories')}</h2>
        
        <form onSubmit={handleSubmit} className="flex items-end gap-3 mb-6">
          <div className="flex-1">
            <label htmlFor="category-name" className="block text-sm font-medium text-slate-400">{t('new_category_name')}</label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t('category_name_placeholder')}
              required
            />
          </div>
          <div>
            <label htmlFor="category-color" className="block text-sm font-medium text-slate-400 text-center">{t('color')}</label>
            <input
              id="category-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 block w-14 h-10 p-1 bg-slate-700 border border-slate-600 rounded-md cursor-pointer"
            />
          </div>
          <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition h-10">{t('add')}</button>
        </form>

        <h3 className="text-lg font-semibold text-slate-300 mb-3">{t('custom_categories')}</h3>
        <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
          {customCategories.length > 0 ? (
            customCategories.map(cat => (
              <div key={cat.key} className="group bg-slate-900/50 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-slate-200">{cat.name}</span>
                </div>
                <button 
                  onClick={() => onDeleteCategory(cat.key)} 
                  className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`${t('delete_aria')} ${cat.name}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4">{t('no_custom_categories')}</p>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md transition">{t('close')}</button>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
