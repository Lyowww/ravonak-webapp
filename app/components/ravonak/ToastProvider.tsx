"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Toast } from "./Toast";

type ToastCtx = { showToast: (msg: string) => void };

const C = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <C.Provider value={{ showToast }}>
      {children}
      <Toast message={toast} />
    </C.Provider>
  );
}

export function useToast() {
  const x = useContext(C);
  if (!x) throw new Error("useToast inside ToastProvider");
  return x;
}
