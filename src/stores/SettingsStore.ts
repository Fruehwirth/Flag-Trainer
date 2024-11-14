import { makeAutoObservable } from 'mobx';
import { GameMode, Language, Region, Difficulty } from '../types/Settings';
import { StorageService } from '../services/StorageService';
import { updateDocumentLanguage } from '../services/TranslationService';

const getBrowserLanguage = (): Language => {
  const storedLanguage = localStorage.getItem('flagTrainer_language');
  if (storedLanguage) {
    updateDocumentLanguage(storedLanguage as Language);
    return storedLanguage as Language;
  }
  const browserLang = navigator.language.toLowerCase();
  const language = browserLang.startsWith('de') ? 'de' : 'en';
  updateDocumentLanguage(language);
  return language;
};

const DEFAULT_SETTINGS = {
  gameMode: 'quiz' as GameMode,
  language: getBrowserLanguage(),
  selectedRegions: ['europe', 'asia', 'north_america', 'africa', 'oceania', 'south_america'] as Region[],
  difficulty: 'medium' as Difficulty
};

export class SettingsStore {
  gameMode: GameMode = DEFAULT_SETTINGS.gameMode;
  language: Language = DEFAULT_SETTINGS.language;
  selectedRegions: Region[] = DEFAULT_SETTINGS.selectedRegions;
  difficulty: Difficulty = DEFAULT_SETTINGS.difficulty;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = StorageService.getSettingsState();
    if (stored) {
      this.gameMode = stored.gameMode;
      this.language = stored.language;
      this.selectedRegions = stored.selectedRegions;
      this.difficulty = stored.difficulty;
    }
  }

  private saveToStorage(): void {
    StorageService.saveSettingsState({
      gameMode: this.gameMode,
      language: this.language,
      selectedRegions: this.selectedRegions,
      difficulty: this.difficulty
    });
  }

  setGameMode(mode: GameMode): void {
    this.gameMode = mode;
    this.saveToStorage();
  }

  setLanguage(language: Language): void {
    this.language = language;
    localStorage.setItem('flagTrainer_language', language);
    updateDocumentLanguage(language);
    this.saveToStorage();
  }

  toggleRegion(region: Region): void {
    const index = this.selectedRegions.indexOf(region);
    if (index === -1) {
      this.selectedRegions.push(region);
    } else {
      this.selectedRegions.splice(index, 1);
    }
    this.saveToStorage();
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.saveToStorage();
  }
}