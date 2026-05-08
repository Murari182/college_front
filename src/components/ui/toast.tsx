import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

type ToastKind = "error" | "success" | "info";

type ToastItem = {
  id: string;
  message: string;
  kind: ToastKind;
};

type ToastContextValue = {
  show: (message: string, kind?: ToastKind) => void;
  error: (message: string) => void;
  success: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function kindClasses(kind: ToastKind): string {
  if (kind === "error") return "bg-red-50 text-red-900 border-red-300";
  if (kind === "success") return "bg-emerald-50 text-emerald-900 border-emerald-300";
  return "bg-slate-100 text-slate-900 border-slate-300";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, kind }]);
      window.setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      error: (message: string) => show(message, "error"),
      success: (message: string) => show(message, "success"),
      info: (message: string) => show(message, "info"),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(92vw,420px)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            aria-live="assertive"
            className={`pointer-events-auto rounded-xl border p-3 shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${kindClasses(toast.kind)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold">{toast.message}</p>
              <button
                type="button"
                onClick={() => remove(toast.id)}
                className="rounded-md p-1 hover:bg-black/5"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
