import { makeAutoObservable, runInAction } from 'mobx';
import { Flag } from '../types/Flag';
import { FlagService } from '../services/FlagService';
import { SettingsStore } from './SettingsStore';
import { shuffle } from '../utils/helpers';

export class GameStore {
  currentFlag: Flag | null = null;
  remainingFlags: Flag[] = [];
  allFlags: Flag[] = [];
  correctCount: number = 0;
  incorrectFlags: Flag[] = [];
  isLoading: boolean = false;
  isGameOver: boolean = false;

  constructor(private settingsStore: SettingsStore) {
    makeAutoObservable(this);
    this.initializeGame();
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
        this.incorrectFlags = [];
        this.isGameOver = false;
        this.isLoading = false;
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
      
      if (this.remainingFlags.length === 0) {
        this.isGameOver = true;
        this.currentFlag = null;
      }
    });

    return answerIsCorrect;
  }

  async replayIncorrect(): Promise<void> {
    runInAction(() => {
      this.allFlags = [...this.incorrectFlags];
      this.remainingFlags = shuffle([...this.incorrectFlags]);
      this.currentFlag = this.remainingFlags[0] || null;
      this.correctCount = 0;
      this.incorrectFlags = [];
      this.isGameOver = false;
      this.isLoading = false;
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