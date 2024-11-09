import React, { useState } from 'react';
import { Region } from '../../types/Settings';
import { useStores } from '../../hooks/useStores';
import { observer } from 'mobx-react-lite';
import './RegionGrid.css';

export const RegionGrid: React.FC = observer(() => {
  const { settingsStore, gameStore } = useStores();
  const basePath = import.meta.env.DEV ? '' : '/Flag-Trainer';
  const [deselectingRegion, setDeselectingRegion] = useState<Region | null>(null);

  const handleRegionToggle = async (region: Region) => {
    if (settingsStore.selectedRegions.includes(region)) {
      setDeselectingRegion(region);
      await new Promise(resolve => setTimeout(resolve, 150)); // Wait for animation
    }
    settingsStore.toggleRegion(region);
    setDeselectingRegion(null);
    if (settingsStore.selectedRegions.length > 0) {
      await gameStore.initializeGame();
    }
  };

  return (
    <div className="region-grid">
      {['north_america', 'europe', 'asia', 'south_america', 'africa', 'oceania'].map((region) => (
        <button
          key={region}
          className={`region-item ${settingsStore.selectedRegions.includes(region as Region) ? 'selected' : ''} ${deselectingRegion === region ? 'deselecting' : ''}`}
          onClick={() => handleRegionToggle(region as Region)}
          disabled={settingsStore.selectedRegions.length === 1 && settingsStore.selectedRegions.includes(region as Region)}
        >
          <img
            src={`${basePath}/data/images/${region}.svg`}
            alt={region.replace('_', ' ')}
            className="region-image"
          />
          {(settingsStore.selectedRegions.includes(region as Region) || deselectingRegion === region) && (
            <span className="checkmark material-symbols-outlined">
              check_circle
            </span>
          )}
        </button>
      ))}
    </div>
  );
}); 