import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { useTranslation } from '../../hooks/useTranslation';
import './GameOver.css';

export const GameOver: React.FC = observer(() => {
  const { gameStore, settingsStore } = useStores();
  const roundCompleteText = useTranslation('roundComplete', settingsStore.language, true);
  const finalScoreText = useTranslation('finalScore', settingsStore.language, true);
  const correctAnswersText = useTranslation('correctAnswers', settingsStore.language, true);
  const startNewRoundText = useTranslation('startNewRound', settingsStore.language, true);
  const replayIncorrectText = useTranslation('replayIncorrect', settingsStore.language, true);

  return (
    <div className="game-over">
      <h2>{roundCompleteText}</h2>
      <div className="stats">
        <div className="stat-item">
          <label>{finalScoreText}:</label>
          <span>{gameStore.scorePercentage}%</span>
        </div>
        <div className="stat-item">
          <label>{correctAnswersText}:</label>
          <span>{gameStore.correctCount} / {gameStore.allFlags.length}</span>
        </div>
      </div>
      <div className="game-over-buttons">
        <button className="restart-button" onClick={() => gameStore.restartGame()}>
          <span className="material-symbols-outlined">play_arrow</span>
          {startNewRoundText}
        </button>
        <button 
          className="replay-incorrect-button" 
          onClick={() => gameStore.replayIncorrect()}
          disabled={gameStore.incorrectFlags.length === 0}
        >
          <span className="material-symbols-outlined">replay</span>
          {replayIncorrectText}
        </button>
      </div>
    </div>
  );
});
