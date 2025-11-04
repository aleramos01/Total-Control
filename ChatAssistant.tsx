import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useLanguage } from '../LanguageContext';
import * as chatService from '../services/chatService';
import ChatMessage from './ChatMessage';
import { SparklesIcon } from './icons/SparklesIcon';
import Spinner from './Spinner';
import { Transaction } from '../types';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, onClose, transactions }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'model', text: t('chat_welcome') }]);
    }
  }, [isOpen, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const modelResponseText = await chatService.sendMessage(userMessage.text, newMessages, transactions);
      const translatedResponse = modelResponseText === 'chat_error' ? t('chat_error') : modelResponseText;
      const modelMessage: Message = { role: 'model', text: translatedResponse };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error sending message to backend:", error);
      const errorMessage: Message = { role: 'model', text: t('chat_error') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center p-0 md:p-4 z-40">
      <div className="bg-slate-800 rounded-t-2xl md:rounded-2xl flex flex-col w-full max-w-2xl h-[90vh] md:h-[70vh] border border-slate-700 shadow-2xl">
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600/20 p-2 rounded-full">
                    <SparklesIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-100">{t('chat_title')}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 rounded-lg p-3 max-w-lg inline-flex items-center gap-2">
                <Spinner className="h-5 w-5 text-slate-300" />
                <span className="text-slate-300 animate-pulse">...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <footer className="p-4 border-t border-slate-700 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('chat_placeholder')}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg shadow-sm py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !inputValue.trim()}
            >
              {t('save')}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatAssistant;
