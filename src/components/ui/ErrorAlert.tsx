import { useEffect, useState } from "react";
import { X } from "lucide-react";

type ErrorAlertProps = {
  message: string | null;
  onClose: () => void;
  autoHideMs?: number;
  className?: string;
};

export function ErrorAlert({
  message,
  onClose,
  autoHideMs = 4000,
  className = "",
}: ErrorAlertProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onClose, 220);
    }, autoHideMs);
    return () => window.clearTimeout(timer);
  }, [message, autoHideMs, onClose]);

  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-900 transition-all duration-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{message}</p>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            window.setTimeout(onClose, 180);
          }}
          className="rounded-md p-1 text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
