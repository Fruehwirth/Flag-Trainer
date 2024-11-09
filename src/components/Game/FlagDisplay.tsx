import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { FlagService } from '../../services/FlagService';
import './FlagDisplay.css';
import { useTranslation } from '../../hooks/useTranslation';

export const FlagDisplay: React.FC = observer(() => {
  const { gameStore, settingsStore } = useStores();
  const loadingText = useTranslation('loading', settingsStore.language, true);
  const [imageSrc, setImageSrc] = React.useState<string>('');
  
  React.useEffect(() => {
    // Pre-cache the next flag and update current image source
    const updateFlags = async () => {
      if (gameStore.currentFlag) {
        await FlagService.preloadImage(gameStore.currentFlag.url);
        setImageSrc(gameStore.currentFlag.url);
      }
      
      // Pre-cache next flag if available
      if (gameStore.remainingFlags.length > 1) {
        const nextFlag = gameStore.remainingFlags[1];
        await FlagService.preloadImage(nextFlag.url);
      }
    };

    updateFlags();
  }, [gameStore.currentFlag]);

  if (!gameStore.currentFlag) {
    return <div className="flag-placeholder">{loadingText}</div>;
  }

  return (
    <div className="flag-container">
      <img
        src={imageSrc}
        alt="Flag to identify"
        className="flag-image"
        loading="eager"
      />
    </div>
  );
});