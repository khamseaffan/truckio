import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from '@/i18n/strings';

const STORAGE_KEY = 'trukio_settings';

interface SettingsState {
  language: Lang;
  isLoaded: boolean;

  setLanguage: (lang: Lang) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'en',
  isLoaded: false,

  setLanguage: (language) => {
    set({ language });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ language })).catch(() => {});
  },

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.language) set({ language: parsed.language });
      }
    } catch {
      // keep defaults
    } finally {
      set({ isLoaded: true });
    }
  },
}));
