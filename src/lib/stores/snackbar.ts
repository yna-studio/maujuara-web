import { writable } from 'svelte/store';

export type SnackbarState = {
  message: string;
  visible: boolean;
};

const initialState: SnackbarState = {
  message: '',
  visible: false
};

export const snackbar = writable<SnackbarState>(initialState);

export function showSnackbar(message: string, duration = 3000) {
  if (!message) return;

  snackbar.set({ message, visible: true });

  if (duration > 0) {
    setTimeout(() => {
      snackbar.update((state) => (state.visible ? { ...state, visible: false } : state));
    }, duration);
  }
}
