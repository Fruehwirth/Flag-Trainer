import React from 'react';
import { observer } from 'mobx-react-lite';
import { Header } from './components/Header/Header';
import { FlagDisplay } from './components/Game/FlagDisplay';
import { QuizMode } from './components/Game/QuizMode';
import { TypeMode } from './components/Game/TypeMode';
import { GameOver } from './components/Game/GameOver';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { useStores } from './hooks/useStores';
import './App.css';

export const App: React.FC = observer(() => {
  const { settingsStore, gameStore } = useStores();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!gameStore.currentFlag && !gameStore.isGameOver) {
      gameStore.initializeGame();
    }

    return () => {
      gameStore.stopTimer();
    };
  }, []);

  return (
    <div className={`app ${settingsStore.gameMode === 'type' ? 'type-mode' : ''}`}>
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      
      {gameStore.isGameOver && <GameOver />}
      
      {!gameStore.isGameOver && (
        <main className="game-container">
          <FlagDisplay />
          {settingsStore.gameMode === 'quiz' ? <QuizMode /> : <TypeMode />}
        </main>
      )}

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
});