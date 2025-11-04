import { CategoryKey } from './constants';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface CustomCategory {
  key: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  isRecurring?: boolean;
  dueDate?: string;
  isPaid?: boolean;
}
