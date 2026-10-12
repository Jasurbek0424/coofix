"use client";

import { create } from "zustand";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone?: "default" | "success" | "danger";
  action?: { label: string; href: string };
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let seq = 0;

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = ++seq;
    set({ toasts: [...get().toasts.slice(-2), { ...toast, id }] });
    setTimeout(() => get().dismiss(id), 4200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
}));

export const toast = (t: Omit<Toast, "id">) => useToasts.getState().push(t);
