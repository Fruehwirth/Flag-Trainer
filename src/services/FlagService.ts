import { Flag } from '../types/Flag';
import { Region } from '../types/Settings';
import { shuffle } from '../utils/helpers';

export class FlagService {
  private static cache: Record<Region, Flag[]> = {
    africa: [],
    asia: [],
    europe: [],
    north_america: [],
    south_america: [],
    oceania: []
  };

  static async fetchFlagSet(region: Region): Promise<Flag[]> {
    if (this.cache[region].length > 0) {
      return this.cache[region];
    }

    try {
      const response = await fetch(`./data/playsets/${region}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${region} flags`);
      }
      const flags = await response.json();
      this.cache[region] = flags;
      return flags;
    } catch (error) {
      console.error(`Error fetching ${region} flags:`, error);
      return [];
    }
  }

  static async getFlagsForRegions(regions: Region[]): Promise<Flag[]> {
    if (regions.length === 0) {
      throw new Error('Please select at least one region');
    }

    const flagPromises = regions.map(region => this.fetchFlagSet(region));
    const flagSets = await Promise.all(flagPromises);
    return shuffle(flagSets.flat());
  }

  static getRandomOptions(flags: Flag[], correctFlag: Flag, count: number = 3, sourceFlags?: Flag[]): Flag[] {
    const options = [correctFlag];
    const availableFlags = (sourceFlags || flags).filter(f => f.country !== correctFlag.country);
    
    while (options.length < count + 1 && availableFlags.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableFlags.length);
      options.push(availableFlags[randomIndex]);
      availableFlags.splice(randomIndex, 1);
    }

    return shuffle(options);
  }

  static preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }
}