import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import './FlagDisplay.css';

export const FlagDisplay: React.FC = observer(() => {
  const { gameStore } = useStores();
  
  if (!gameStore.currentFlag) {
    return <div className="flag-placeholder">Loading...</div>;
  }

  return (
    <div className="flag-container">
      <img
        src={gameStore.currentFlag.url}
        alt="Flag to identify"
        className="flag-image"
        loading="eager"
      />
    </div>
  );
});