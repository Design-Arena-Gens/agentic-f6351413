"use client";

import { createContext, Dispatch, SetStateAction, useContext, useEffect } from "react";
import styles from "./ToastProvider.module.css";

type ToastState = {
  toasts: string[];
  setToasts: Dispatch<SetStateAction<string[]>>;
};

const Context = createContext<ToastState | null>(null);

export const ToastProvider = Context.Provider;

export function useToast() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("Toast context missing");
  }
  return ctx;
}

export function ToastContext() {
  const value = useContext(Context);

  useEffect(() => {
    if (!value) return;
    if (value.toasts.length === 0) return;
    const timeout = setTimeout(() => value.setToasts((prev) => prev.slice(1)), 4000);
    return () => clearTimeout(timeout);
  }, [value]);

  if (!value || value.toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {value.toasts.map((message, index) => (
        <div key={index} className={styles.toast}>
          {message}
        </div>
      ))}
    </div>
  );
}
