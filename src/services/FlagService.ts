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
    
    console.log('=== New Flag Selection ===');
    console.log('Correct flag:', correctFlag.country);
    const correctGroups = this.getGroupsForCountry(correctFlag.country);
    console.log('Correct flag groups:', correctGroups.map(g => ({ name: g.name, weight: g.weight })));
    
    const availableFlags = (sourceFlags || flags).filter(f => f.country !== correctFlag.country);
    const options = [correctFlag];
  
    if (difficulty === 'easy') {
      // Get flags with no common groups
      const flagsWithNoCommonGroups = availableFlags.filter(flag => {
        const flagGroups = this.getGroupsForCountry(flag.country);
        const hasCommonGroup = flagGroups.some(group => 
          correctGroups.some(correctGroup => correctGroup.name === group.name)
        );
        return !hasCommonGroup;
      });
  
      console.log(`Found ${flagsWithNoCommonGroups.length} flags with no common groups`);
  
      // Randomly select from flags with no common groups
      while (options.length < count + 1 && flagsWithNoCommonGroups.length > 0) {
        const randomIndex = Math.floor(Math.random() * flagsWithNoCommonGroups.length);
        const selectedFlag = flagsWithNoCommonGroups[randomIndex];
        console.log(`Selected flag ${selectedFlag.country} (no common groups)`);
        options.push(selectedFlag);
        flagsWithNoCommonGroups.splice(randomIndex, 1);
      }
  
    } else if (difficulty === 'hard') {
      // Create weighted pool of flags based on group weights
      const flagPool: { flag: Flag; weight: number }[] = [];
      
      availableFlags.forEach(flag => {
        const flagGroups = this.getGroupsForCountry(flag.country);
        const commonGroups = flagGroups.filter(group => 
          correctGroups.some(correctGroup => correctGroup.name === group.name)
        );
        
        if (commonGroups.length > 0) {
          // Much more extreme exponential weighting (4^weight instead of 2^weight)
          const totalWeight = commonGroups.reduce((sum, group) => sum + Math.pow(4, group.weight), 0);
          flagPool.push({ flag, weight: totalWeight });
        }
      });
  
      // Sort by weight descending for logging purposes
      flagPool.sort((a, b) => b.weight - a.weight);
      
      console.log('Weighted flag pool:', flagPool.map(({ flag, weight }) => ({
        country: flag.country,
        weight,
        commonGroups: this.getGroupsForCountry(flag.country)
          .filter(group => correctGroups.some(g => g.name === group.name))
          .map(g => ({ name: g.name, weight: g.weight }))
      })));
  
      // Select flags with probability based on weights
      while (options.length < count + 1 && flagPool.length > 0) {
        const totalWeight = flagPool.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedIndex = 0;
  
        for (let i = 0; i < flagPool.length; i++) {
          random -= flagPool[i].weight;
          if (random <= 0) {
            selectedIndex = i;
            break;
          }
        }
  
        const selectedFlag = flagPool[selectedIndex].flag;
        const commonGroups = this.getGroupsForCountry(selectedFlag.country)
          .filter(group => correctGroups.some(g => g.name === group.name));
        
        console.log(`Selected flag ${selectedFlag.country}:`, {
          weight: flagPool[selectedIndex].weight,
          commonGroups: commonGroups.map(g => ({ name: g.name, weight: g.weight })),
          selectionProbability: (flagPool[selectedIndex].weight / totalWeight * 100).toFixed(2) + '%'
        });
        
        options.push(selectedFlag);
        flagPool.splice(selectedIndex, 1);
      }
  
    } else {
      // Medium difficulty - completely random selection
      const remainingFlags = [...availableFlags];
      while (options.length < count + 1 && remainingFlags.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingFlags.length);
        const selectedFlag = remainingFlags[randomIndex];
        
        const commonGroups = this.getGroupsForCountry(selectedFlag.country)
          .filter(group => correctGroups.some(g => g.name === group.name));
        
        console.log(`Selected random flag ${selectedFlag.country}:`, {
          commonGroups: commonGroups.map(g => ({ name: g.name, weight: g.weight }))
        });
        
        options.push(selectedFlag);
        remainingFlags.splice(randomIndex, 1);
      }
    }
  
    // Fill remaining slots with random flags if needed
    if (options.length < count + 1) {
      console.log('Filling remaining slots with random flags');
      const remainingFlags = availableFlags.filter(f => !options.includes(f));
      while (options.length < count + 1 && remainingFlags.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingFlags.length);
        options.push(remainingFlags[randomIndex]);
        remainingFlags.splice(randomIndex, 1);
      }
    }
  
    return shuffle(options);
  }
}