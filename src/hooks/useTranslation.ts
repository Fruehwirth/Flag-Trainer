import { useState, useEffect } from 'react';
import { TranslationService } from '../services/TranslationService';
import { Language } from '../types/Settings';

export function useTranslation(key: string, language: Language, isUI = false) {
  const [translation, setTranslation] = useState(key);

  useEffect(() => {
    let isMounted = true;

    const loadTranslation = async () => {
      const text = await TranslationService.getTranslation(language, key, isUI);
      if (isMounted) {
        setTranslation(text);
      }
    };

    loadTranslation();

    return () => {
      isMounted = false;
    };
  }, [key, language, isUI]);

  return translation;
} 