import { Flag } from '../types/Flag';
import { Region, Difficulty } from '../types/Settings';
import { shuffle } from '../utils/helpers';

interface DifficultyGroup {
  name: string;
  weight: number;
  countries: string[];
}

interface DifficultyGroups {
  groups: DifficultyGroup[];
}

export class FlagService {
  private static cache: Record<Region, Flag[]> = {
    africa: [],
    asia: [],
    europe: [],
    north_america: [],
    south_america: [],
    oceania: []
  };

  private static difficultyGroups: DifficultyGroup[] = [];

  static async loadDifficultyGroups() {
    if (this.difficultyGroups.length === 0) {
      const response = await fetch('./data/difficulty_groups.json');
      const data: DifficultyGroups = await response.json();
      this.difficultyGroups = data.groups;
    }
  }

  static getGroupsForCountry(country: string): DifficultyGroup[] {
    return this.difficultyGroups.filter(group => 
      group.countries.includes(country)
    );
  }

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
      // Try to get from cache if fetch fails
      const cachedResponse = await caches.match(`./data/playsets/${region}.json`);
      if (cachedResponse) {
        const flags = await cachedResponse.json();
        this.cache[region] = flags;
        return flags;
      }
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

  static async getRandomOptions(flags: Flag[], correctFlag: Flag, count: number = 3, sourceFlags?: Flag[], difficulty: Difficulty = 'medium'): Promise<Flag[]> {
    await this.loadDifficultyGroups();
    
    const correctGroups = this.getGroupsForCountry(correctFlag.country);
    const options = [correctFlag];
    const availableFlags = (sourceFlags || flags).filter(f => f.country !== correctFlag.country);
    
    const similarPercentage = difficulty === 'easy' ? 0.1 : 
                            difficulty === 'medium' ? 0.5 : 0.9;
    
    const similarCount = Math.round(count * similarPercentage);

    // Get similar flags
    if (similarCount > 0) {
      const similarFlags = availableFlags
        .map(flag => ({
          flag,
          commonGroups: this.getGroupsForCountry(flag.country)
            .filter(group => correctGroups.some(g => g.name === group.name))
        }))
        .filter(({ commonGroups }) => commonGroups.length > 0)
        .filter(({ flag }) => !options.some(existingFlag => existingFlag.country === flag.country))
        .sort((a, b) => {
          const aMaxWeight = Math.max(...a.commonGroups.map(g => g.weight));
          const bMaxWeight = Math.max(...b.commonGroups.map(g => g.weight));
          return difficulty === 'easy' ? aMaxWeight - bMaxWeight : bMaxWeight - aMaxWeight;
        });

      for (let i = 0; i < similarCount && similarFlags.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * Math.min(3, similarFlags.length));
        options.push(similarFlags[randomIndex].flag);
        similarFlags.splice(randomIndex, 1);
      }
    }

    // Fill remaining with random flags
    const remainingFlags = availableFlags.filter(flag => 
      !options.some(existingFlag => existingFlag.country === flag.country)
    );
    
    while (options.length < count + 1 && remainingFlags.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingFlags.length);
      options.push(remainingFlags[randomIndex]);
      remainingFlags.splice(randomIndex, 1);
    }

    return shuffle(options);
  }
}