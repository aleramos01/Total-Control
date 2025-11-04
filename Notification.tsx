
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90';
  const iconColor = type === 'success' ? 'text-green-200' : 'text-red-200';
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div
      role="alert"
      className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-xl text-white backdrop-blur-sm border border-slate-600/50 transition-all duration-300 ${bgColor} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
    >
      <div className={`mr-3 ${iconColor}`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default Notification;
