import { GameState } from '../types/GameState';
import { Settings } from '../types/Settings';

const STORAGE_KEYS = {
  SETTINGS: 'flag-trainer-settings',
  GAME_STATE: 'flag-trainer-state'
} as const;

export class StorageService {
  static saveSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static loadSettings(): Settings | null {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : null;
  }

  static saveGameState(state: GameState): void {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
  }

  static loadGameState(): GameState | null {
    const state = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    return state ? JSON.parse(state) : null;
  }

  static clearGameState(): void {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  }
}