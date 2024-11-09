import { Language } from '../types/Settings';

export class TranslationService {
  private static cache: Record<Language, Record<string, string>> = {
    en: {},
    de: {}
  };

  private static loadingPromises: Record<Language, Promise<Record<string, string>> | null> = {
    en: null,
    de: null
  };

  static async loadTranslations(language: Language): Promise<Record<string, string>> {
    if (Object.keys(this.cache[language]).length > 0) {
      return this.cache[language];
    }

    if (this.loadingPromises[language]) {
      return this.loadingPromises[language]!;
    }

    this.loadingPromises[language] = (async () => {
      try {
        const basePath = import.meta.env.DEV ? '' : 'https://fruehwirth.github.io/Flag-Trainer';
        const response = await fetch(`${basePath}/assets/translations/${language}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const translations = await response.json();
        this.cache[language] = translations;
        return translations;
      } catch (error) {
        console.error("Error loading translations:", error);
        return {};
      } finally {
        this.loadingPromises[language] = null;
      }
    })();

    return this.loadingPromises[language]!;
  }

  static async getTranslation(language: Language, key: string): Promise<string> {
    const translations = await this.loadTranslations(language);
    return translations[key] || key;
  }
}