export type GameMode = 'quiz' | 'type';
export type Language = 'en' | 'de';
export type Region = 'africa' | 'asia' | 'europe' | 'north_america' | 'south_america' | 'oceania';

export interface Settings {
  gameMode: GameMode;
  language: Language;
  selectedRegions: Region[];
}