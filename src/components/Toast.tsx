'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ToastContext = createContext<{
  addToast: (message: string, type?: Toast['type']) => void;
}>({
  addToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle size={16} className="text-notion-green" />,
    error: <AlertCircle size={16} className="text-notion-red" />,
    info: <Info size={16} className="text-notion-blue" />,
  };

  const borderColors = {
    success: 'border-l-notion-green',
    error: 'border-l-notion-red',
    info: 'border-l-notion-blue',
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 bg-notion-bg border border-notion-border ${borderColors[toast.type]} border-l-[3px] rounded-lg shadow-lg text-sm max-w-[360px] animate-[slideLeft_0.2s_ease]`}
          >
            {icons[toast.type]}
            <span className="flex-1 text-notion-text">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-notion-text-tertiary hover:text-notion-text">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
