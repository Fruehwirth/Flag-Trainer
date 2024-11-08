import React from 'react';
import { observer } from 'mobx-react-lite';
import { ProgressBar } from './ProgressBar';
import { useStores } from '../../hooks/useStores';
import './Header.css';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = observer(({ onSettingsClick }) => {
  const { gameStore } = useStores();
  
  return (
    <header className="header">
      <button 
        className="settings-button material-symbols-outlined"
        onClick={onSettingsClick}
        aria-label="Open settings"
      >
        settings
      </button>
      
      <h1>Flag Trainer</h1>
      
      <div className="score-container">
        <span className="score">
          {gameStore.scorePercentage}%
        </span>
      </div>
      
      <ProgressBar progress={gameStore.progress} />
    </header>
  );
});