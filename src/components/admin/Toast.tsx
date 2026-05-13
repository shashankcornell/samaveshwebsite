"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 3500 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const colors = {
    success: "bg-emerald-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-stone-900 text-white",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-lg px-4 py-3 shadow-xl text-sm font-medium transition-all duration-300 ${colors[type]} ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const show = (message: string, type: ToastType = "success") => setToast({ message, type });
  const hide = () => setToast(null);

  const ToastEl = toast ? <Toast message={toast.message} type={toast.type} onClose={hide} /> : null;

  return { show, ToastEl };
}
