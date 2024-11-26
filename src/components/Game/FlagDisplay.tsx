import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import './FlagDisplay.css';
import { useTranslation } from '../../hooks/useTranslation';

export const FlagDisplay: React.FC = observer(() => {
  const { gameStore, settingsStore } = useStores();
  const loadingText = useTranslation('loading', settingsStore.language, true);
  const [isChanging, setIsChanging] = React.useState(false);
  const [displayedFlag, setDisplayedFlag] = React.useState(gameStore.currentFlag);
  
  React.useEffect(() => {
    if (gameStore.currentFlag) {
      setIsChanging(true);
      // Wait for fade out before updating displayed flag
      setTimeout(() => {
        setDisplayedFlag(gameStore.currentFlag);
        setIsChanging(false);
      }, 150);
    }
  }, [gameStore.currentFlag]);

  if (!displayedFlag) {
    return <div className="flag-placeholder">{loadingText}</div>;
  }

  return (
    <div className="flag-container">
      <img
        src={displayedFlag.url}
        alt="Flag to identify"
        className={`flag-image ${isChanging ? 'changing' : ''}`}
        loading="eager"
      />
    </div>
  );
});