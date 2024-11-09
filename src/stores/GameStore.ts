import { makeAutoObservable, runInAction } from 'mobx';
import { Flag } from '../types/Flag';
import { FlagService } from '../services/FlagService';
import { StorageService } from '../services/StorageService';
import { SettingsStore } from './SettingsStore';
import { shuffle } from '../utils/helpers';

export class GameStore {
  currentFlag: Flag | null = null;
  remainingFlags: Flag[] = [];
  allFlags: Flag[] = [];
  correctCount: number = 0;
  isLoading: boolean = false;
  isGameOver: boolean = false;

  constructor(private settingsStore: SettingsStore) {
    makeAutoObservable(this);
    this.loadGameState();
  }

  private loadGameState(): void {
    const savedState = StorageService.loadGameState();
    if (savedState) {
      this.currentFlag = savedState.currentFlag;
      this.remainingFlags = savedState.remainingFlags;
      this.allFlags = savedState.allFlags;
      this.correctCount = savedState.correctCount;
      this.isGameOver = savedState.remainingFlags.length === 0;
    }
  }

  async initializeGame(): Promise<void> {
    this.isLoading = true;
    try {
      const flags = await FlagService.getFlagsForRegions(this.settingsStore.selectedRegions);
      runInAction(() => {
        this.allFlags = flags;
        this.remainingFlags = shuffle([...flags]);
        this.currentFlag = this.remainingFlags[0] || null;
        this.correctCount = 0;
        this.isGameOver = false;
        this.isLoading = false;
      });
      this.saveGameState();
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
      }
      this.remainingFlags = this.remainingFlags.slice(1);
      this.currentFlag = this.remainingFlags[0] || null;
      
      if (this.remainingFlags.length === 0) {
        this.isGameOver = true;
        this.currentFlag = null;
      }
    });

    this.saveGameState();
    return answerIsCorrect;
  }

  private saveGameState(): void {
    StorageService.saveGameState({
      currentFlag: this.currentFlag,
      remainingFlags: this.remainingFlags,
      allFlags: this.allFlags,
      correctCount: this.correctCount,
    });
  }

  get progress(): number {
    return ((this.allFlags.length - this.remainingFlags.length) / this.allFlags.length) * 100;
  }

  get scorePercentage(): string {
    let totalCount = this.allFlags.length - this.remainingFlags.length;
    if (totalCount === 0) return '0';
    return ((this.correctCount / totalCount) * 100).toFixed(0);
  }

  async restartGame(): Promise<void> {
    await this.initializeGame();
  }
}