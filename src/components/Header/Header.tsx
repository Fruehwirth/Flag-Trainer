import React from 'react';
import { observer } from 'mobx-react-lite';
import { ProgressBar } from './ProgressBar';
import { useStores } from '../../hooks/useStores';
import './Header.css';

interface HeaderProps {
  onSettingsClick: () => void;
  showControls: boolean;
  onRestart: () => void;
}

export const Header: React.FC<HeaderProps> = observer(({ onSettingsClick, showControls, onRestart }) => {
  const { gameStore } = useStores();
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = React.useState(showControls);

  React.useEffect(() => {
    if (!showControls) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match the CSS transition duration
      return () => clearTimeout(timer);
    }
    setIsVisible(true);
  }, [showControls]);

  const handleRefreshStart = () => {
    const timer = setTimeout(() => {
      localStorage.clear();
      window.location.reload();
    }, 1000);
    setLongPressTimer(timer);
  };

  const handleRefreshEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleRefreshClick = () => {
    const button = document.querySelector('.refresh-button') as HTMLElement;
    button?.classList.remove('rotating');
    // Trigger reflow
    void button?.offsetWidth;
    button?.classList.add('rotating');
    onRestart();
  };
  
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
      
      {isVisible && (
        <div className={`score-container ${!showControls ? 'hidden' : ''}`}>
          <span className="score">
            {gameStore.scorePercentage}%
          </span>
          <button
            className="refresh-button material-symbols-outlined"
            onClick={handleRefreshClick}
            onMouseDown={handleRefreshStart}
            onMouseUp={handleRefreshEnd}
            onMouseLeave={handleRefreshEnd}
            onTouchStart={handleRefreshStart}
            onTouchEnd={handleRefreshEnd}
            aria-label="Restart game"
          >
            refresh
          </button>
        </div>
      )}
      
      <ProgressBar progress={gameStore.progress} />
    </header>
  );
});