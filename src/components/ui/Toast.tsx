import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface ToastCtx {
  toast: (message: string, type?: Toast['type']) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export const useToast = () => useContext(Ctx);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons = { success: CheckCircle, warning: AlertTriangle, info: Info };
  const colors = {
    success: 'border-emerald-500/30 text-emerald-400',
    warning: 'border-amber-500/30 text-amber-400',
    info: 'border-cyan-500/30 text-cyan-400',
  };

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={`glass-strong rounded-xl p-4 flex items-start gap-3 toast-enter border ${colors[t.type]}`}>
              <Icon size={18} className="shrink-0 mt-0.5" />
              <span className="text-sm text-white/80 flex-1">{t.message}</span>
              <button onClick={() => remove(t.id)} className="shrink-0 p-0.5 hover:bg-white/10 rounded">
                <X size={14} className="text-white/40" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
