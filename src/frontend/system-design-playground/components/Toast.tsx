import React from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-500/10 border-green-500/50 text-green-500',
    error: 'bg-red-500/10 border-red-500/50 text-red-500',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-500',
    warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[toast.type]} backdrop-blur-sm animate-slideIn`}
    >
      {icons[toast.type]}
      <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-secondary hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

let toastCounter = 0;
let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

export const toast = {
  success: (message: string) => addToast('success', message),
  error: (message: string) => addToast('error', message),
  info: (message: string) => addToast('info', message),
  warning: (message: string) => addToast('warning', message),
};

function addToast(type: ToastType, message: string) {
  const id = `toast-${++toastCounter}`;
  const newToast = { id, type, message };
  toasts = [...toasts, newToast];
  notifyListeners();

  // Auto remove after 3 seconds
  setTimeout(() => {
    removeToast(id);
  }, 3000);
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

function notifyListeners() {
  toastListeners.forEach((listener) => listener(toasts));
}

export const ToastContainer: React.FC = () => {
  const [currentToasts, setCurrentToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    toastListeners.push(setCurrentToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
      {currentToasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={removeToast} />
      ))}
    </div>
  );
};
