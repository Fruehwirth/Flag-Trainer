import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { GameMode, Language } from '../../types/Settings';
import './SettingsPanel.css';
import { useTranslation } from '../../hooks/useTranslation';
import { RegionGrid } from './RegionGrid';

export const SettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = observer(({ isOpen, onClose }) => {
  const { settingsStore, gameStore } = useStores();
  const [isClosing, setIsClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Translation hooks
  const settingsText = useTranslation('settings', settingsStore.language, true);
  const gameModeText = useTranslation('gameMode', settingsStore.language, true);
  const quizText = useTranslation('quiz', settingsStore.language, true);
  const typeText = useTranslation('type', settingsStore.language, true);
  const languageText = useTranslation('language', settingsStore.language, true);
  const regionsText = useTranslation('regions', settingsStore.language, true);

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

      <h2>{settingsText}</h2>

      <section className="settings-section">
        <h3>{gameModeText}</h3>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="game-mode"
              value="quiz"
              checked={settingsStore.gameMode === 'quiz'}
              onChange={() => handleGameModeChange('quiz')}
            />
            {quizText}
          </label>
          <label>
            <input
              type="radio"
              name="game-mode"
              value="type"
              checked={settingsStore.gameMode === 'type'}
              onChange={() => handleGameModeChange('type')}
            />
            {typeText}
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h3>{languageText}</h3>
        <select
          value={settingsStore.language}
          onChange={(e) => settingsStore.setLanguage(e.target.value as Language)}
        >
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </section>

      <section className="settings-section">
        <h3>{regionsText}</h3>
        <RegionGrid />
      </section>
    </div>
  );
});