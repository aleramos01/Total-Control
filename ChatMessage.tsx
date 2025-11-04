import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-indigo-300" />
        </div>
      )}
      <div
        className={`rounded-lg px-4 py-2 max-w-lg whitespace-pre-wrap ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-700 text-slate-200'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;