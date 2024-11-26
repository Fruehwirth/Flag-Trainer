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
    
    const options = [correctFlag];
    const availableFlags = (sourceFlags || flags).filter(f => f.country !== correctFlag.country);
    const correctGroups = this.getGroupsForCountry(correctFlag.country);
    
    // Calculate similarity scores for all available flags
    const flagsWithScores = availableFlags.map(flag => {
      const commonGroups = this.getGroupsForCountry(flag.country)
        .filter(group => correctGroups.some(g => g.name === group.name));
      
      // Calculate similarity score based on common groups and their weights
      const similarityScore = commonGroups.reduce((sum, group) => sum + group.weight, 0);
      
      return { flag, similarityScore };
    });

    // Sort by similarity score (higher score = more similar)
    flagsWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

    // Select flags based on difficulty
    const similarCount = difficulty === 'easy' ? Math.round(count * 0.3) : 
                        difficulty === 'medium' ? Math.round(count * 0.7) : 
                        Math.round(count * 0.9);

    // Get similar flags from top portion
    const topSimilar = flagsWithScores.slice(0, Math.ceil(flagsWithScores.length * 0.2));
    for (let i = 0; i < similarCount && topSimilar.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * topSimilar.length);
      options.push(topSimilar[randomIndex].flag);
      topSimilar.splice(randomIndex, 1);
    }

    // Fill remaining with random flags
    const remainingFlags = flagsWithScores
      .filter(({ flag }) => !options.some(opt => opt.country === flag.country))
      .map(({ flag }) => flag);

    while (options.length < count + 1 && remainingFlags.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingFlags.length);
      options.push(remainingFlags[randomIndex]);
      remainingFlags.splice(randomIndex, 1);
    }

    return shuffle(options);
  }
}