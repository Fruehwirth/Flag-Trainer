import { makeAutoObservable } from 'mobx';
import { Settings, GameMode, Language, Region } from '../types/Settings';
import { StorageService } from '../services/StorageService';

const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('de') ? 'de' : 'en';
};

const DEFAULT_SETTINGS: Settings = {
  gameMode: 'quiz',
  language: getBrowserLanguage(),
  selectedRegions: ['europe', 'asia', 'north_america', 'africa', 'oceania', 'south_america']
};

export class SettingsStore {
  gameMode: GameMode = DEFAULT_SETTINGS.gameMode;
  language: Language = DEFAULT_SETTINGS.language;
  selectedRegions: Region[] = DEFAULT_SETTINGS.selectedRegions;

  constructor() {
    makeAutoObservable(this);
    this.loadSettings();
  }

  private loadSettings(): void {
    console.log('navigator.language', navigator.language);
    const savedSettings = StorageService.loadSettings();
    if (savedSettings) {
      this.gameMode = savedSettings.gameMode;
      this.language = savedSettings.language;
      this.selectedRegions = savedSettings.selectedRegions;
    }
  }

  setGameMode(mode: GameMode): void {
    this.gameMode = mode;
    this.saveSettings();
  }

  setLanguage(language: Language): void {
    this.language = language;
    this.saveSettings();
  }

  toggleRegion(region: Region): void {
    const index = this.selectedRegions.indexOf(region);
    if (index === -1) {
      this.selectedRegions.push(region);
    } else {
      this.selectedRegions.splice(index, 1);
    }
    this.saveSettings();
  }

  private saveSettings(): void {
    StorageService.saveSettings({
      gameMode: this.gameMode,
      language: this.language,
      selectedRegions: this.selectedRegions
    });
  }
}