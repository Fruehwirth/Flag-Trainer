import { Flag } from './Flag';

export interface GameState {
  currentFlag: Flag | null;
  nextFlag: Flag | null;
  remainingFlags: Flag[];
  allFlags: Flag[];
  correctCount: number;
  totalCount: number;
}