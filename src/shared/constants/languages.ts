export const LANGUAGES = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
} as const;

export type LanguageCode = keyof typeof LANGUAGES;
