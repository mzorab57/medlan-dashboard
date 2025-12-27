import { create } from 'zustand';

let nextId = 1;

export const useToast = create((set) => ({
  toasts: [],
  add(message, type = 'info', duration = 3000) {
    const id = nextId++;
    const t = { id, message, type };
    set((s) => ({ toasts: [...s.toasts, t] }));
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
      }, duration);
    }
    return id;
  },
  remove(id) {
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
  },
}));
