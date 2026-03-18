/**
 * ErrorToast
 * Mirrors legacy ErrorToast.js.
 * Global error notification shown as a bottom-left snackbar/toast.
 * Reads error state from course store and auto-dismisses.
 */

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ErrorToastProps {
  error: string | null;
  onDismiss: () => void;
}

export function ErrorToast({ error, onDismiss }: ErrorToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [error, onDismiss]);

  if (!visible || !error) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[500px] animate-in slide-in-from-bottom-2">
      <span className="text-sm font-semibold flex-1">{error}</span>
      <button
        onClick={() => {
          setVisible(false);
          onDismiss();
        }}
        className="cursor-pointer hover:bg-red-700 rounded p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
