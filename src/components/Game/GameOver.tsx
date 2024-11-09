import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import './GameOver.css';

export const GameOver: React.FC = observer(() => {
  const { gameStore } = useStores();

  return (
    <div className="game-over">
      <h2>Round Complete!</h2>
      <div className="stats">
        <div className="stat-item">
          <label>Final Score:</label>
          <span>{gameStore.scorePercentage}%</span>
        </div>
        <div className="stat-item">
          <label>Correct Answers:</label>
          <span>{gameStore.correctCount} / {gameStore.allFlags.length}</span>
        </div>
      </div>
      <button className="restart-button" onClick={() => gameStore.restartGame()}>
        Start New Round
      </button>
    </div>
  );
});
