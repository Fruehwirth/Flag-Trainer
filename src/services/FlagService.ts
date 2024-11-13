import { Flag } from '../types/Flag';
import { Region, Difficulty } from '../types/Settings';
import { shuffle } from '../utils/helpers';
import { TranslationService } from '../services/TranslationService';

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
    
    // Calculate similar flags percentage based on difficulty
    const similarPercentage = difficulty === 'easy' ? 0.1 : 
                            difficulty === 'medium' ? 0.5 : 0.9;
    
    const similarCount = Math.round(count * similarPercentage);
    const randomCount = count - similarCount;

    // Log current flag info
    const translation = await TranslationService.getTranslation('en', correctFlag.country);
    console.log(`Current Flag: ${translation} | ${correctFlag.country}`);
    console.log('Member of Groups:');
    correctGroups.forEach(group => {
      console.log(`\t${group.name} [${group.weight}]`);
    });

    // Get similar flags
    if (similarCount > 0) {
      const similarFlags = availableFlags
        .map(flag => ({
          flag,
          commonGroups: this.getGroupsForCountry(flag.country)
            .filter(group => correctGroups.some(g => g.name === group.name))
        }))
        .filter(({ commonGroups }) => commonGroups.length > 0)
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
    while (options.length < count + 1 && availableFlags.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableFlags.length);
      options.push(availableFlags[randomIndex]);
      availableFlags.splice(randomIndex, 1);
    }

    const shuffledOptions = shuffle(options);

    // Log options info
    console.log('Shown Options:');
    for (const option of shuffledOptions) {
      const optionTranslation = await TranslationService.getTranslation('en', option.country);
      const commonGroups = this.getGroupsForCountry(option.country)
        .filter(group => correctGroups.some(g => g.name === group.name))
        .map(g => g.name);
      console.log(`${optionTranslation} | ${option.country}: ${commonGroups.join(', ') || 'No common groups'}`);
    }

    return shuffledOptions;
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