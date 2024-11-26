import React from 'react';
import { observer } from 'mobx-react-lite';
import { Header } from './components/Header/Header';
import { FlagDisplay } from './components/Game/FlagDisplay';
import { QuizMode } from './components/Game/QuizMode';
import { TypeMode } from './components/Game/TypeMode';
import { GameOver } from './components/Game/GameOver';
import { StartScreen } from './components/Game/StartScreen';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { useStores } from './hooks/useStores';
import './App.css';
import { StorageService } from './services/StorageService';
import { PickerMode } from './components/Game/PickerMode';

export const App: React.FC = observer(() => {
  const { settingsStore, gameStore } = useStores();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [showStartScreen, setShowStartScreen] = React.useState(() => {
    const gameState = StorageService.getGameState();
    return !gameState || (gameState.allFlags.length === gameState.remainingFlags.length);
  });
  const [isGameContainerVisible, setIsGameContainerVisible] = React.useState(true);
  const [viewportHeight, setViewportHeight] = React.useState(window.innerHeight);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      }
    };

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  React.useEffect(() => {
    return () => {
      gameStore.stopTimer();
    };
  }, []);

  const handleGameStart = () => {
    setShowStartScreen(false);
  };

  const handleRestart = () => {
    setIsGameContainerVisible(false);
    setTimeout(() => {
      gameStore.clearGameState();
      gameStore.initializeGame();
      setShowStartScreen(true);
      setIsGameContainerVisible(true);
    }, 200);
  };

  return (
    <div 
      className={`app ${settingsStore.gameMode === 'type' ? 'type-mode' : ''}`}
      style={{ height: viewportHeight }}
    >
      <Header 
        onSettingsClick={() => setIsSettingsOpen(true)} 
        showControls={!showStartScreen}
        onRestart={handleRestart}
      />
      
      <div 
        className="start-screen-container"
        style={{
          position: 'fixed',
          top: '76px',
          left: 0,
          right: 0,
          bottom: 0,
          opacity: showStartScreen ? 1 : 0,
          pointerEvents: showStartScreen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
          zIndex: showStartScreen ? 40 : -1
        }}
      >
        <StartScreen onStart={handleGameStart} />
      </div>
      
      <div style={{ 
        opacity: showStartScreen || !isGameContainerVisible ? 0 : 1,
        pointerEvents: showStartScreen ? 'none' : 'auto',
        transition: 'opacity 0.2s ease'
      }}>
        <main className="game-container">
          {settingsStore.gameMode !== 'picker' && <FlagDisplay />}
          {settingsStore.gameMode === 'quiz' && <QuizMode />}
          {settingsStore.gameMode === 'type' && <TypeMode />}
          {settingsStore.gameMode === 'picker' && <PickerMode />}
        </main>
        {gameStore.isGameOver && (
          <>
            <div className="game-over-overlay" />
            <GameOver onRestart={handleRestart} />
          </>
        )}
      </div>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
});