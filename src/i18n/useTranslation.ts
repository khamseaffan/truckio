import { useSettingsStore } from '@/store/settingsStore';
import strings, { type StringKey } from './strings';

/**
 * Returns a `t()` function that resolves string keys to the user's chosen language.
 * Falls back to English if a key is missing in the selected language.
 */
export function useTranslation() {
  const lang = useSettingsStore(s => s.language);

  function t(key: StringKey): string {
    return strings[lang]?.[key] ?? strings.en[key];
  }

  return { t, lang };
}
