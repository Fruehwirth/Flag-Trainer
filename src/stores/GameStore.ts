import { makeAutoObservable, runInAction } from 'mobx';
import { Flag } from '../types/Flag';
import { FlagService } from '../services/FlagService';
import { StorageService } from '../services/StorageService';
import { SettingsStore } from './SettingsStore';
import { shuffle } from '../utils/helpers';

export class GameStore {
  currentFlag: Flag | null = null;
  nextFlag: Flag | null = null;
  remainingFlags: Flag[] = [];
  allFlags: Flag[] = [];
  correctCount: number = 0;
  totalCount: number = 0;
  isLoading: boolean = false;

  constructor(private settingsStore: SettingsStore) {
    makeAutoObservable(this);
    this.loadGameState();
  }

  private loadGameState(): void {
    const savedState = StorageService.loadGameState();
    if (savedState) {
      this.currentFlag = savedState.currentFlag;
      this.nextFlag = savedState.nextFlag;
      this.remainingFlags = savedState.remainingFlags;
      this.allFlags = savedState.allFlags;
      this.correctCount = savedState.correctCount;
      this.totalCount = savedState.totalCount;
    }
  }

  async initializeGame(): Promise<void> {
    this.isLoading = true;
    try {
      const flags = await FlagService.getFlagsForRegions(this.settingsStore.selectedRegions);
      runInAction(() => {
        this.allFlags = flags;
        this.remainingFlags = [...flags];
        this.currentFlag = null;
        this.nextFlag = null;
        this.correctCount = 0;
        this.totalCount = 0;
        this.isLoading = false;
      });
      await this.prepareNextFlag();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async prepareNextFlag(): Promise<void> {
    if (this.remainingFlags.length === 0) {
      this.remainingFlags = shuffle([...this.allFlags]);
    }

    if (!this.currentFlag) {
      this.currentFlag = this.remainingFlags.pop() || null;
    } else {
      this.currentFlag = this.nextFlag;
    }

    if (this.remainingFlags.length > 0) {
      const nextFlag = this.remainingFlags[this.remainingFlags.length - 1];
      
      try {
        await FlagService.preloadImage(nextFlag.url);
        
        runInAction(() => {
          this.nextFlag = nextFlag;
          this.remainingFlags.pop();
          this.isLoading = false;
        });

        this.saveGameState();
      } catch (error) {
        console.error('Failed to prepare next flag:', error);
        runInAction(() => {
          this.isLoading = false;
        });
      }
    }
  }

  checkAnswer(answer: string): boolean {
    if (!this.currentFlag) return false;

    const isCorrect = answer.toLowerCase() === this.currentFlag.country.toLowerCase();
    runInAction(() => {
      this.totalCount++;
      if (isCorrect) {
        this.correctCount++;
      }
    });

    return isCorrect;
  }

  private saveGameState(): void {
    StorageService.saveGameState({
      currentFlag: this.currentFlag,
      nextFlag: this.nextFlag,
      remainingFlags: this.remainingFlags,
      allFlags: this.allFlags,
      correctCount: this.correctCount,
      totalCount: this.totalCount
    });
  }

  get progress(): number {
    if (this.allFlags.length === 0 || this.correctCount === 0) return 0;
    return (this.correctCount / this.allFlags.length) * 100;
  }

  get scorePercentage(): string {
    if (this.totalCount === 0) return '0';
    return ((this.correctCount / this.totalCount) * 100).toFixed(0);
  }

  async handleCorrectAnswer(): Promise<void> {
    runInAction(() => {
      const flagIndex = this.remainingFlags.indexOf(this.currentFlag!);
      if (flagIndex > -1) {
        this.remainingFlags.splice(flagIndex, 1);
      }
    });
    this.saveGameState();
  }

  async handleIncorrectAnswer(): Promise<void> {
    this.saveGameState();
  }
}