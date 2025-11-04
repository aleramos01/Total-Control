import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as api from './services/api';
import Spinner from './components/Spinner';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => {
        try { return localStorage.getItem('authToken'); } catch { return null; }
    });
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
            try {
                const res = await api.fetchUserProfile();
                const userData = await res.json();
                setUser(userData);
            } catch (error) {
                console.error('Failed to load user, token might be invalid.', error);
                localStorage.removeItem('authToken');
                setToken(null);
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const handleAuthResponse = async (res: Response) => {
        const { token, user } = await res.json();
        setToken(token);
        setUser(user);
        try {
            localStorage.setItem('authToken', token);
        } catch (error) {
            console.error("Failed to save authToken to localStorage", error);
        }
    };

    const login = async (data: any) => {
        const res = await api.loginUser(data);
        await handleAuthResponse(res);
    };

    const register = async (data: any) => {
        const res = await api.registerUser(data);
        await handleAuthResponse(res);
    };

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        try {
            localStorage.removeItem('authToken');
        } catch (error) {
            console.error("Failed to remove authToken from localStorage", error);
        }
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Spinner className="h-16 w-16 text-indigo-400" />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
