import { GameMode, Language, Region, Difficulty } from '../types/Settings';
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
  difficulty: Difficulty;
}

export class StorageService {
  private static GAME_STATE_KEY = 'flagTrainer_gameState';
  private static SETTINGS_STATE_KEY = 'flagTrainer_settingsState';
  private static HIGHSCORES_KEY = 'flagTrainer_highscores';

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

  static getHighscore(regions: Region[], gameMode: GameMode, difficulty: Difficulty): number | null {
    const highscores = this.getHighscores();
    const key = this.createHighscoreKey(regions, gameMode, difficulty);
    return highscores[key] || null;
  }

  static setHighscore(regions: Region[], gameMode: GameMode, difficulty: Difficulty, score: number): void {
    const highscores = this.getHighscores();
    const key = this.createHighscoreKey(regions, gameMode, difficulty);
    highscores[key] = score;
    localStorage.setItem(this.HIGHSCORES_KEY, JSON.stringify(highscores));
  }

  private static getHighscores(): Record<string, number> {
    const stored = localStorage.getItem(this.HIGHSCORES_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private static createHighscoreKey(regions: Region[], gameMode: GameMode, difficulty: Difficulty): string {
    const sortedRegions = [...regions].sort().join(',');
    return `${sortedRegions}|${gameMode}|${difficulty}`;
  }
} 