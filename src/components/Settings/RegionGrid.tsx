import React from 'react';
import { Region } from '../../types/Settings';
import { useStores } from '../../hooks/useStores';
import { observer } from 'mobx-react-lite';
import './RegionGrid.css';

export const RegionGrid: React.FC = observer(() => {
  const { settingsStore, gameStore } = useStores();
  const basePath = import.meta.env.DEV ? '' : '/Flag-Trainer';

  const handleRegionToggle = async (region: Region) => {
    settingsStore.toggleRegion(region);
    if (settingsStore.selectedRegions.length > 0) {
      await gameStore.initializeGame();
    }
  };

  return (
    <div className="region-grid">
      {['africa', 'asia', 'europe', 'north_america', 'south_america', 'oceania'].map((region) => (
        <button
          key={region}
          className={`region-item ${settingsStore.selectedRegions.includes(region as Region) ? 'selected' : ''}`}
          onClick={() => handleRegionToggle(region as Region)}
          disabled={settingsStore.selectedRegions.length === 1 && settingsStore.selectedRegions.includes(region as Region)}
        >
          <img
            src={`${basePath}/data/images/${region}.svg`}
            alt={region.replace('_', ' ')}
            className="region-image"
          />
          {settingsStore.selectedRegions.includes(region as Region) && (
            <span className="checkmark material-symbols-outlined">
              check_circle
            </span>
          )}
        </button>
      ))}
    </div>
  );
}); 