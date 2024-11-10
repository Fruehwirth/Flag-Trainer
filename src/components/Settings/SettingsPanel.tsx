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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    
    if (isLeftSwipe) {
      handleClose();
    }
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
    gameStore.clearGameState();
    await gameStore.initializeGame();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`settings-panel ${isClosing ? 'closing' : ''}`} 
      ref={panelRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
        <div className="game-mode-options">
          <div className="game-mode-option">
            <input
              type="radio"
              id="quiz-mode"
              name="game-mode"
              value="quiz"
              checked={settingsStore.gameMode === 'quiz'}
              onChange={() => handleGameModeChange('quiz')}
            />
            <label htmlFor="quiz-mode" className="game-mode-label">
              <span className="game-mode-icon material-symbols-outlined">
                quiz
              </span>
              {quizText}
            </label>
          </div>
          <div className="game-mode-option">
            <input
              type="radio"
              id="type-mode"
              name="game-mode"
              value="type"
              checked={settingsStore.gameMode === 'type'}
              onChange={() => handleGameModeChange('type')}
            />
            <label htmlFor="type-mode" className="game-mode-label">
              <span className="game-mode-icon material-symbols-outlined">
                keyboard
              </span>
              {typeText}
            </label>
          </div>
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