import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { useTranslation } from '../../hooks/useTranslation';
import { GameMode, Difficulty } from '../../types/Settings';
import { RegionGrid } from '../Settings/RegionGrid';
import './StartScreen.css';

const DifficultyButton: React.FC<{
  difficulty: Difficulty;
  selected: boolean;
  onClick: () => void;
}> = ({ difficulty, selected, onClick }) => {
  const { settingsStore } = useStores();
  const text = useTranslation(difficulty, settingsStore.language, true);
  
  return (
    <button
      className={`difficulty-button ${selected ? 'selected' : ''} ${difficulty}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export const StartScreen: React.FC<{
  onStart: () => void;
}> = observer(({ onStart }) => {
  const { settingsStore, gameStore } = useStores();
  const gameModeText = useTranslation('gameMode', settingsStore.language, true);
  const quizText = useTranslation('quiz', settingsStore.language, true);
  const typeText = useTranslation('type', settingsStore.language, true);
  const regionsText = useTranslation('regions', settingsStore.language, true);
  const startNewRoundText = useTranslation('startNewRound', settingsStore.language, true);
  const difficultyText = useTranslation('difficulty', settingsStore.language, true);
  const easyText = useTranslation('easy', settingsStore.language, true);
  const mediumText = useTranslation('medium', settingsStore.language, true);
  const hardText = useTranslation('hard', settingsStore.language, true);

  const handleGameModeChange = (mode: GameMode) => {
    settingsStore.setGameMode(mode);
  };

  const handleStart = () => {
    onStart();
  };

  return (
    <div className="start-screen">
      <div className="start-screen-content">
        <section className="settings-section">
          <h3>{gameModeText}</h3>
          <div className="game-mode-options">
            <div className="game-mode-option">
              <input
                type="radio"
                id="quiz"
                name="gameMode"
                checked={settingsStore.gameMode === 'quiz'}
                onChange={() => handleGameModeChange('quiz')}
              />
              <label htmlFor="quiz" className="game-mode-label">
                <span className="game-mode-icon material-symbols-outlined">quiz</span>
                {quizText}
              </label>
            </div>
            <div className="game-mode-option">
              <input
                type="radio"
                id="type"
                name="gameMode"
                checked={settingsStore.gameMode === 'type'}
                onChange={() => handleGameModeChange('type')}
              />
              <label htmlFor="type" className="game-mode-label">
                <span className="game-mode-icon material-symbols-outlined">keyboard</span>
                {typeText}
              </label>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3>{regionsText}</h3>
          <RegionGrid />
        </section>

        <section className="settings-section">
          <h3>{difficultyText}</h3>
          <div className="difficulty-buttons">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
              <DifficultyButton
                key={diff}
                difficulty={diff}
                selected={settingsStore.difficulty === diff}
                onClick={() => {
                  settingsStore.setDifficulty(diff);
                  gameStore.initializeGame();
                }}
              />
            ))}
          </div>
        </section>

        <button 
          className="start-button"
          onClick={handleStart}
          disabled={settingsStore.selectedRegions.length === 0}
        >
          <span className="material-symbols-outlined">play_arrow</span>
          {startNewRoundText}
        </button>
      </div>
    </div>
  );
}); 