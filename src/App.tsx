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

export const App: React.FC = observer(() => {
  const { settingsStore, gameStore } = useStores();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [showStartScreen, setShowStartScreen] = React.useState(true);

  React.useEffect(() => {
    if (showStartScreen) {
      gameStore.initializeGame();
    }
    return () => {
      gameStore.stopTimer();
    };
  }, [showStartScreen]);

  const handleGameStart = () => {
    setShowStartScreen(false);
  };

  const handleRestart = () => {
    setShowStartScreen(true);
    gameStore.clearGameState();
  };

  return (
    <div className={`app ${settingsStore.gameMode === 'type' ? 'type-mode' : ''}`}>
      <Header 
        onSettingsClick={() => setIsSettingsOpen(true)} 
        showControls={!showStartScreen}
        onRestart={handleRestart}
      />
      
      {showStartScreen ? (
        <>
          <StartScreen onStart={handleGameStart} />
          <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
            <FlagDisplay />
          </div>
        </>
      ) : (
        <>
          {!gameStore.isGameOver && (
            <main className="game-container">
              <FlagDisplay />
              {settingsStore.gameMode === 'quiz' ? <QuizMode /> : <TypeMode />}
            </main>
          )}
          {gameStore.isGameOver && (
            <GameOver onRestart={() => setShowStartScreen(true)} />
          )}
        </>
      )}

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
});