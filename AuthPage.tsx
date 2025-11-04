import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../LanguageContext';
import { useNotification } from '../NotificationContext';
import Spinner from './Spinner';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password });
        showNotification(t('register_success'), 'success');
      }
    } catch (error) {
      // Fix: Handle API errors which are Response objects
      let errorMessage = t('chat_error');
      if (error instanceof Response) {
        try {
          const errorData = await error.json();
          errorMessage = errorData.message || error.statusText;
        } catch (jsonError) {
          errorMessage = error.statusText || t('chat_error');
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      showNotification(errorMessage, 'error');
      setIsLoading(false);
    }
    // Não é necessário setIsLoading(false) em caso de sucesso porque o aplicativo será remontado
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <header className="py-6 mb-4 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          {t('header_title')}
        </h1>
        <p className="text-slate-400 mt-2">{t('header_subtitle')}</p>
      </header>
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">
          {isLogin ? t('login_title') : t('register_title')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-400">{t('email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-400">{t('password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoading ? <Spinner className="h-5 w-5"/> : (isLogin ? t('login_button') : t('register_button'))}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? t('no_account') : t('has_account')}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-indigo-400 hover:text-indigo-300">
            {isLogin ? t('register_now') : t('login_now')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
