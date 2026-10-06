import { en } from './en';
import { bn } from './bn';
import { Language } from '../types';

export const translations = { en, bn };

export type TranslationKey = keyof typeof en;

export function getTranslation(lang: Language, key: TranslationKey, params?: Record<string, string | number>): string {
  const dict = translations[lang] || translations.en;
  let text = (dict as any)[key] || (translations.en as any)[key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }

  return text;
}
