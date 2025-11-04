import { Transaction, CustomCategory } from '../types';

const DELAY = 300; // Simula a latência da rede para uma melhor experiência do usuário

// --- Utilitário para interagir com o LocalStorage ---
const ls = {
    get: <T>(key: string, defaultValue: T): T => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error(`Error getting item ${key} from localStorage`, e);
            return defaultValue;
        }
    },
    set: (key: string, value: any): void => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error setting item ${key} in localStorage`, e);
        }
    },
};

// --- API de Transações ---
export const fetchTransactions = async (): Promise<Transaction[]> => {
    await new Promise(res => setTimeout(res, DELAY));
    return ls.get<Transaction[]>('transactions', []);
};

export const saveTransaction = async (tx: Omit<Transaction, 'id'> & { id?: string }): Promise<Transaction> => {
    await new Promise(res => setTimeout(res, DELAY));
    let transactions = ls.get<Transaction[]>('transactions', []);
    let savedTransaction: Transaction;

    if (tx.id) { // Atualizar
        savedTransaction = { ...tx, id: tx.id };
        transactions = transactions.map(t => t.id === tx.id ? savedTransaction : t);
    } else { // Criar
        savedTransaction = { ...tx, id: Date.now().toString(), isPaid: false };
        transactions.push(savedTransaction);
    }
    
    ls.set('transactions', transactions);
    return savedTransaction;
};

export const deleteTransaction = async (id: string): Promise<void> => {
    await new Promise(res => setTimeout(res, DELAY));
    let transactions = ls.get<Transaction[]>('transactions', []);
    transactions = transactions.filter(t => t.id !== id);
    ls.set('transactions', transactions);
};

export const toggleTransactionPaidStatus = async (id: string): Promise<Transaction> => {
    await new Promise(res => setTimeout(res, DELAY));
    let transactions = ls.get<Transaction[]>('transactions', []);
    const txIndex = transactions.findIndex(t => t.id === id);

    if (txIndex === -1) {
        throw new Error('Transaction not found');
    }

    const updatedTransaction = { ...transactions[txIndex], isPaid: !transactions[txIndex].isPaid };
    transactions[txIndex] = updatedTransaction;
    ls.set('transactions', transactions);

    return updatedTransaction;
};

// --- API de Categorias ---
export const fetchCustomCategories = async (): Promise<CustomCategory[]> => {
    await new Promise(res => setTimeout(res, DELAY));
    return ls.get<CustomCategory[]>('customCategories', []);
};

export const addCustomCategory = async (category: Omit<CustomCategory, 'key'>): Promise<CustomCategory> => {
    await new Promise(res => setTimeout(res, DELAY));
    const categories = ls.get<CustomCategory[]>('customCategories', []);
    const newCategory: CustomCategory = {
        ...category,
        key: category.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
    };
    categories.push(newCategory);
    ls.set('customCategories', categories);
    
    return newCategory;
};

export const deleteCustomCategory = async (key: string): Promise<void> => {
    await new Promise(res => setTimeout(res, DELAY));
    const transactions = ls.get<Transaction[]>('transactions', []);
    const isCategoryInUse = transactions.some(tx => tx.category === key);

    if(isCategoryInUse){
        throw new Error('Category is in use and cannot be deleted.');
    }

    let categories = ls.get<CustomCategory[]>('customCategories', []);
    categories = categories.filter(cat => cat.key !== key);
    ls.set('customCategories', categories);
};

// --- Auth API (Mock) ---

interface User {
  email: string;
}

interface Credentials {
  email: string;
  password: string;
}

export const registerUser = async (data: Credentials): Promise<Response> => {
    await new Promise(res => setTimeout(res, DELAY));
    const users = ls.get<Credentials[]>('users', []);
    if (users.some(u => u.email === data.email)) {
        return new Response(JSON.stringify({ message: 'User already exists' }), { status: 409, statusText: 'Conflict' });
    }
    users.push(data);
    ls.set('users', users);
    const token = `mock-token-for-${data.email}-${Date.now()}`;
    const user: User = { email: data.email };
    return new Response(JSON.stringify({ token, user }), { status: 201 });
};

export const loginUser = async (data: Credentials): Promise<Response> => {
    await new Promise(res => setTimeout(res, DELAY));
    const users = ls.get<Credentials[]>('users', []);
    const userInDb = users.find(u => u.email === data.email);
    if (!userInDb || userInDb.password !== data.password) {
        return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401, statusText: 'Unauthorized' });
    }
    const token = `mock-token-for-${data.email}-${Date.now()}`;
    const user: User = { email: data.email };
    return new Response(JSON.stringify({ token, user }), { status: 200 });
};

export const fetchUserProfile = async (): Promise<Response> => {
    await new Promise(res => setTimeout(res, DELAY));
    const token = ls.get<string | null>('authToken', null);
    if (!token || !token.startsWith('mock-token-for-')) {
        return new Response(JSON.stringify({ message: 'Invalid or missing token' }), { status: 401, statusText: 'Unauthorized' });
    }
    const email = token.split('-')[3];
    const user: User = { email };
    return new Response(JSON.stringify(user), { status: 200 });
};
