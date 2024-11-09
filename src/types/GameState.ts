import { Flag } from './Flag';

export interface GameState {
  currentFlag: Flag | null;
  remainingFlags: Flag[];
  allFlags: Flag[];
  correctCount: number;
  incorrectFlags: Flag[];
}