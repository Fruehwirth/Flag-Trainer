import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { useTranslation } from '../../hooks/useTranslation';
import './GameOver.css';

export const GameOver: React.FC<{
  onRestart: () => void;
}> = observer(({ onRestart }) => {
  const { gameStore, settingsStore } = useStores();
  const roundCompleteText = useTranslation('roundComplete', settingsStore.language, true);
  const newHighscoreText = useTranslation('newHighscore', settingsStore.language, true);
  const finalScoreText = useTranslation('finalScore', settingsStore.language, true);
  const correctAnswersText = useTranslation('correctAnswers', settingsStore.language, true);
  const timeText = useTranslation('time', settingsStore.language, true);
  const startNewRoundText = useTranslation('startNewRound', settingsStore.language, true);
  const replayIncorrectText = useTranslation('replayIncorrect', settingsStore.language, true);
  const difficultyText = useTranslation('difficulty', settingsStore.language, true);
  const difficultyLevelText = useTranslation(settingsStore.difficulty, settingsStore.language, true);
  const gameModeText = useTranslation('gameMode', settingsStore.language, true);

  const handleReplayIncorrect = () => {
    gameStore.replayIncorrect();
  };

  const hasIncorrectFlags = gameStore.incorrectFlags.length > 0;

  return (
    <div className="game-over">
      <h2>{gameStore.isNewHighscore ? newHighscoreText : roundCompleteText}</h2>
      <div className="stats">
        <div className="stat-item">
          <label>{finalScoreText}:</label>
          <span>{gameStore.scorePercentage}%</span>
        </div>
        <div className="stat-item">
          <label>{correctAnswersText}:</label>
          <span>{gameStore.correctCount} / {gameStore.allFlags.length}</span>
        </div>
        <div className="stat-item">
          <label>{timeText}:</label>
          <span>{gameStore.formatTime()}</span>
        </div>
        <div className="stat-item">
          <label>{difficultyText}:</label>
          <span>{difficultyLevelText}</span>
        </div>
        <div className="stat-item">
          <label>{gameModeText}:</label>
          <span className="with-icon">
            <span className="material-symbols-outlined">
              {settingsStore.gameMode === 'quiz' ? 'quiz' : 
               settingsStore.gameMode === 'type' ? 'keyboard' : 'flag'}
            </span>
            {useTranslation(settingsStore.gameMode, settingsStore.language, true)}
          </span>
        </div>
      </div>
      <div className={`game-over-buttons ${!hasIncorrectFlags ? 'single-button' : ''}`}>
        <button className="restart-button" onClick={onRestart}>
          <span className="material-symbols-outlined">play_arrow</span>
          {startNewRoundText}
        </button>
        {hasIncorrectFlags && (
          <button 
            className="replay-incorrect-button" 
            onClick={handleReplayIncorrect}
          >
            <span className="material-symbols-outlined">replay</span>
            {replayIncorrectText}
          </button>
        )}
      </div>
    </div>
  );
});
