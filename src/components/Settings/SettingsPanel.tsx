import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { GameMode, Language, Region } from '../../types/Settings';
import './SettingsPanel.css';

export const SettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = observer(({ isOpen, onClose }) => {
  const { settingsStore, gameStore } = useStores();
  const [isClosing, setIsClosing] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleGameModeChange = async (mode: GameMode) => {
    settingsStore.setGameMode(mode);
    await gameStore.initializeGame();
  };

  const handleRegionToggle = async (region: Region) => {
    settingsStore.toggleRegion(region);
    if (settingsStore.selectedRegions.length > 0) {
      await gameStore.initializeGame();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`settings-panel ${isClosing ? 'closing' : ''}`} ref={panelRef}>
      <button 
        className="close-button material-symbols-outlined"
        onClick={handleClose}
        aria-label="Close settings"
      >
        close
      </button>

      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Game Mode</h3>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="game-mode"
              value="quiz"
              checked={settingsStore.gameMode === 'quiz'}
              onChange={() => handleGameModeChange('quiz')}
            />
            Quiz
          </label>
          <label>
            <input
              type="radio"
              name="game-mode"
              value="type"
              checked={settingsStore.gameMode === 'type'}
              onChange={() => handleGameModeChange('type')}
            />
            Type
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h3>Language</h3>
        <select
          value={settingsStore.language}
          onChange={(e) => settingsStore.setLanguage(e.target.value as Language)}
        >
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </section>

      <section className="settings-section">
        <h3>Regions</h3>
        <div className="checkbox-group">
          {['africa', 'asia', 'europe', 'north_america', 'south_america', 'oceania'].map((region) => (
            <label key={region}>
              <input
                type="checkbox"
                checked={settingsStore.selectedRegions.includes(region as Region)}
                onChange={() => handleRegionToggle(region as Region)}
              />
              {region.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
});