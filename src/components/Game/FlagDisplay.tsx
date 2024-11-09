import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import './FlagDisplay.css';
import { useTranslation } from '../../hooks/useTranslation';

export const FlagDisplay: React.FC = observer(() => {
  const { gameStore, settingsStore } = useStores();
  const loadingText = useTranslation('loading', settingsStore.language, true);
  
  if (!gameStore.currentFlag) {
    return <div className="flag-placeholder">{loadingText}</div>;
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