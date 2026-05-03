"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

let addToastGlobal: ((msg: string, type: Toast["type"]) => void) | null = null;

export function toast(message: string, type: Toast["type"] = "info") {
  addToastGlobal?.(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = counter.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => { addToastGlobal = addToast; return () => { addToastGlobal = null; }; }, [addToast]);

  const icons = { success: "✓", error: "✕", info: "ℹ" };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span style={{fontWeight:700,fontSize:16}}>{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
