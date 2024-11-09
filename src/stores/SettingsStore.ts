import { makeAutoObservable } from 'mobx';
import { GameMode, Language, Region } from '../types/Settings';
import { StorageService } from '../services/StorageService';

const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('de') ? 'de' : 'en';
};

const DEFAULT_SETTINGS = {
  gameMode: 'quiz' as GameMode,
  language: getBrowserLanguage(),
  selectedRegions: ['europe', 'asia', 'north_america', 'africa', 'oceania', 'south_america'] as Region[]
};

export class SettingsStore {
  gameMode: GameMode = DEFAULT_SETTINGS.gameMode;
  language: Language = DEFAULT_SETTINGS.language;
  selectedRegions: Region[] = DEFAULT_SETTINGS.selectedRegions;

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
    }
  }

  private saveToStorage(): void {
    StorageService.saveSettingsState({
      gameMode: this.gameMode,
      language: this.language,
      selectedRegions: this.selectedRegions
    });
  }

  setGameMode(mode: GameMode): void {
    this.gameMode = mode;
    this.saveToStorage();
  }

  setLanguage(language: Language): void {
    this.language = language;
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
}