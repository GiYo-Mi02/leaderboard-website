import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ToastCtx = createContext({ notify: (_msg, _type, _details) => {} });

export function useToast() {
  return useContext(ToastCtx);
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const notify = (message, type = 'error', details = undefined) => {
    const id = ++idRef.current;
    const toast = { id, message, type, details };
    setToasts((t) => [...t, toast]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3600);
  };

  // expose global notifier for non-React code (e.g., axios interceptors)
  useEffect(() => {
    const prev = window.__notify;
    window.__notify = notify;
    return () => {
      window.__notify = prev;
    };
  }, []);

  const value = useMemo(() => ({ notify }), []);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} type={t.type} message={t.message} details={t.details} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ type, message, details }) {
  const color = type === 'error' ? 'bg-rose-600/90 border-rose-400/40' : type === 'success' ? 'bg-emerald-600/90 border-emerald-400/40' : 'bg-sky-600/90 border-sky-400/40';
  const toCopy = typeof details === 'undefined' ? message : (typeof details === 'string' ? details : safeStringify(details));
  const onCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(String(toCopy ?? ''));
    } catch {}
  };
  return (
    <div role="alert" className={`pointer-events-auto w-80 rounded-lg border ${color} text-white shadow-lg backdrop-blur p-3`}> 
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium break-words whitespace-pre-wrap">{message}</div>
        </div>
      </div>
    </div>
  );
}

function safeStringify(obj) {
  try { return JSON.stringify(obj, null, 2); } catch { return String(obj); }
}
