import { Language } from '../types/Settings';

export class TranslationService {
  private static cache: Record<Language, Record<string, string>> = {
    en: {},
    de: {}
  };

  private static uiCache: Record<Language, Record<string, string>> = {
    en: {},
    de: {}
  };

  private static loadingPromises: Record<Language, Promise<Record<string, string>> | null> = {
    en: null,
    de: null
  };

  private static uiLoadingPromises: Record<Language, Promise<Record<string, string>> | null> = {
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

    this.loadingPromises[language] = this.fetchTranslations(language, 'translations');
    return this.loadingPromises[language]!;
  }

  static async loadUITranslations(language: Language): Promise<Record<string, string>> {
    if (Object.keys(this.uiCache[language]).length > 0) {
      return this.uiCache[language];
    }

    if (this.uiLoadingPromises[language]) {
      return this.uiLoadingPromises[language]!;
    }

    this.uiLoadingPromises[language] = this.fetchTranslations(language, 'translations/ui');
    return this.uiLoadingPromises[language]!;
  }

  private static async fetchTranslations(language: Language, path: string): Promise<Record<string, string>> {
    try {
      const basePath = import.meta.env.DEV ? '' : 'https://fruehwirth.github.io/Flag-Trainer';
      const response = await fetch(`${basePath}/assets/${path}/${language}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const translations = await response.json();
      if (path === 'translations') {
        this.cache[language] = translations;
      } else {
        this.uiCache[language] = translations;
      }
      return translations;
    } catch (error) {
      console.error(`Error loading ${path}:`, error);
      return {};
    } finally {
      if (path === 'translations') {
        this.loadingPromises[language] = null;
      } else {
        this.uiLoadingPromises[language] = null;
      }
    }
  }

  static async getTranslation(language: Language, key: string, isUI = false): Promise<string> {
    const translations = isUI 
      ? await this.loadUITranslations(language)
      : await this.loadTranslations(language);
    return translations[key] || key;
  }
}

export const updateDocumentLanguage = (language: Language) => {
  document.documentElement.lang = language;
};