import { makeAutoObservable, runInAction } from 'mobx';
import { Flag } from '../types/Flag';
import { FlagService } from '../services/FlagService';
import { SettingsStore } from './SettingsStore';
import { shuffle } from '../utils/helpers';
import { StorageService } from '../services/StorageService';

export class GameStore {
  currentFlag: Flag | null = null;
  remainingFlags: Flag[] = [];
  allFlags: Flag[] = [];
  originalFlags: Flag[] = [];
  correctCount: number = 0;
  incorrectFlags: Flag[] = [];
  isLoading: boolean = false;
  isGameOver: boolean = false;
  elapsedTime: number = 0;

  private quizState: {
    options: string[];
    translatedOptions: string[];
    isAnswered: boolean;
    selectedAnswer: string | null;
  } | null = null;

  private typeState: {
    answer: string;
    feedback: 'correct' | 'incorrect' | null;
    correctAnswer: string;
    isProcessing: boolean;
  } | null = null;

  private isReplayMode: boolean = false;
  private timerInterval: NodeJS.Timer | null = null;

  constructor(private settingsStore: SettingsStore) {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = StorageService.getGameState();
    if (stored) {
      this.currentFlag = stored.currentFlag;
      this.remainingFlags = stored.remainingFlags;
      this.originalFlags = stored.originalFlags;
      this.allFlags = stored.allFlags;
      this.correctCount = stored.correctCount;
      this.incorrectFlags = stored.incorrectFlags;
      this.isLoading = false;
      this.isGameOver = stored.isGameOver;
      this.isReplayMode = stored.isReplayMode;
      this.quizState = stored.quizState;
      this.typeState = stored.typeState;
      this.elapsedTime = stored.elapsedTime;
      FlagService.preloadImage(this.currentFlag?.url || '');
    } else {
      this.initializeGame();
    }
  }

  private saveToStorage(): void {
    StorageService.saveGameState({
      currentFlag: this.currentFlag,
      remainingFlags: this.remainingFlags,
      allFlags: this.allFlags,
      originalFlags: this.originalFlags,
      correctCount: this.correctCount,
      incorrectFlags: this.incorrectFlags,
      isLoading: this.isLoading,
      isGameOver: this.isGameOver,
      isReplayMode: this.isReplayMode,
      quizState: this.quizState,
      typeState: this.typeState,
      elapsedTime: this.elapsedTime
    });
  }

  async initializeGame(): Promise<void> {
    this.isLoading = true;
    this.elapsedTime = 0;
    try {
      const flags = await FlagService.getFlagsForRegions(this.settingsStore.selectedRegions);
      runInAction(() => {
        this.originalFlags = flags;
        this.allFlags = flags;
        this.remainingFlags = shuffle([...flags]);
        this.currentFlag = this.remainingFlags[0] || null;
        this.correctCount = 0;
        this.incorrectFlags = [];
        this.isGameOver = false;
        this.isLoading = false;
        this.quizState = null;
        this.typeState = null;
        this.startTimer();
        this.saveToStorage();
      });
    } catch (error) {
      console.error('Failed to initialize game:', error);
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async handleAnswer(answer: string, isCorrect?: boolean): Promise<boolean> {
    if (!this.currentFlag) return false;

    const answerIsCorrect = isCorrect !== undefined ? 
      isCorrect : 
      answer.toLowerCase() === this.currentFlag.country.toLowerCase();
    
    runInAction(() => {
      if (answerIsCorrect) {
        this.correctCount++;
      } else {
        this.incorrectFlags.push(this.currentFlag!);
      }
      this.remainingFlags = this.remainingFlags.slice(1);
      this.currentFlag = this.remainingFlags[0] || null;
      this.quizState = null;
      
      if (this.remainingFlags.length === 0) {
        this.isGameOver = true;
        this.currentFlag = null;
        this.stopTimer();
      }
      this.saveToStorage();
    });

    return answerIsCorrect;
  }

  async replayIncorrect(): Promise<void> {
    runInAction(() => {
      this.isReplayMode = true;
      this.allFlags = [...this.incorrectFlags];
      this.remainingFlags = shuffle([...this.incorrectFlags]);
      this.currentFlag = this.remainingFlags[0] || null;
      this.correctCount = 0;
      this.incorrectFlags = [];
      this.isGameOver = false;
      this.isLoading = false;
      this.elapsedTime = 0;
      this.startTimer();
      this.saveToStorage();
    });
  }

  async restartGame(): Promise<void> {
    this.isReplayMode = false;
    StorageService.clearStorage();
    await this.initializeGame();
  }

  get progress(): number {
    if (this.remainingFlags === this.incorrectFlags) {
      return ((this.incorrectFlags.length - this.remainingFlags.length) / this.incorrectFlags.length) * 100;
    }
    return ((this.allFlags.length - this.remainingFlags.length) / this.allFlags.length) * 100;
  }

  get scorePercentage(): string {
    let totalCount = this.isReplayMode ? 
      this.allFlags.length : 
      this.allFlags.length - this.remainingFlags.length;
    if (totalCount === 0) return '0';
    return ((this.correctCount / totalCount) * 100).toFixed(0);
  }

  getQuizState() {
    return this.quizState;
  }

  saveQuizState(state: typeof this.quizState) {
    this.quizState = state;
    this.saveToStorage();
  }

  clearGameState(): void {
    runInAction(() => {
      this.currentFlag = null;
      this.remainingFlags = [];
      this.allFlags = [];
      this.originalFlags = [];
      this.correctCount = 0;
      this.incorrectFlags = [];
      this.isLoading = false;
      this.isGameOver = false;
      this.isReplayMode = false;
      this.quizState = null;
      this.typeState = null;
      StorageService.clearGameState();
    });
  }

  startTimer(): void {
    if (!this.timerInterval) {
      this.timerInterval = setInterval(() => {
        runInAction(() => {
          this.elapsedTime += 1;
          this.saveToStorage();
        });
      }, 1000);
    }
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval as NodeJS.Timeout);
      this.timerInterval = null;
    }
  }

  formatTime(): string {
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = this.elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}