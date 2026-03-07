import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UiState {
  toasts: Toast[];
  activeModal: string | null;
  isGlobalLoading: boolean;

  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  activeModal: null,
  isGlobalLoading: false,

  showToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Date.now().toString(), message, type },
      ],
    })),

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),
}));
