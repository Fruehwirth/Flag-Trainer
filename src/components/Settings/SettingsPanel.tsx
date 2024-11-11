import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { Language } from '../../types/Settings';
import './SettingsPanel.css';
import { useTranslation } from '../../hooks/useTranslation';

export const SettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = observer(({ isOpen, onClose }) => {
  const { settingsStore } = useStores();
  const [isClosing, setIsClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Translation hooks
  const settingsText = useTranslation('settings', settingsStore.language, true);
  const languageText = useTranslation('language', settingsStore.language, true);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    
    if (isLeftSwipe) {
      handleClose();
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={`settings-panel ${isClosing ? 'closing' : ''}`} 
      ref={panelRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button 
        className="close-button material-symbols-outlined"
        onClick={handleClose}
        aria-label="Close settings"
      >
        close
      </button>

      <h2>{settingsText}</h2>

      <section className="settings-section">
        <h3>{languageText}</h3>
        <select 
          value={settingsStore.language} 
          onChange={(e) => settingsStore.setLanguage(e.target.value as Language)}
        >
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </section>
    </div>
  );
});