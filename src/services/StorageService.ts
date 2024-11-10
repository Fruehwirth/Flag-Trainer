import { GameMode, Language, Region } from '../types/Settings';
import { Flag } from '../types/Flag';

interface GameState {
  currentFlag: Flag | null;
  remainingFlags: Flag[];
  allFlags: Flag[];
  originalFlags: Flag[];
  correctCount: number;
  incorrectFlags: Flag[];
  isLoading: boolean;
  isGameOver: boolean;
  isReplayMode: boolean;
  elapsedTime: number;
  quizState: {
    options: string[];
    translatedOptions: string[];
    isAnswered: boolean;
    selectedAnswer: string | null;
  } | null;
  typeState: {
    answer: string;
    feedback: 'correct' | 'incorrect' | null;
    correctAnswer: string;
    isProcessing: boolean;
  } | null;
}

interface SettingsState {
  gameMode: GameMode;
  language: Language;
  selectedRegions: Region[];
}

export class StorageService {
  private static GAME_STATE_KEY = 'flagTrainer_gameState';
  private static SETTINGS_STATE_KEY = 'flagTrainer_settingsState';

  static saveGameState(state: GameState): void {
    localStorage.setItem(this.GAME_STATE_KEY, JSON.stringify(state));
  }

  static getGameState(): GameState | null {
    const stored = localStorage.getItem(this.GAME_STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  static saveSettingsState(state: SettingsState): void {
    localStorage.setItem(this.SETTINGS_STATE_KEY, JSON.stringify(state));
  }

  static getSettingsState(): SettingsState | null {
    const stored = localStorage.getItem(this.SETTINGS_STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  static clearStorage(): void {
    localStorage.removeItem(this.GAME_STATE_KEY);
    localStorage.removeItem(this.SETTINGS_STATE_KEY);
  }

  static clearGameState(): void {
    localStorage.removeItem(this.GAME_STATE_KEY);
  }
} 