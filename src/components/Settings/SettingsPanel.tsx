import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { Language } from '../../types/Settings';
import './SettingsPanel.css';
import { useTranslation } from '../../hooks/useTranslation';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

const isAppInstalled = () => {
  // Check if running as PWA
  if (isPWA()) return true;
  
  // Check if on iOS and installed to home screen
  if ((window.navigator as any).standalone) return true;
  
  // Check if using installed PWA on Android
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  
  // Check if installed through browser
  if (document.referrer.includes('android-app://')) return true;
  
  // Check if using TWA (Trusted Web Activity)
  if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
  
  return false;
};

export const SettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = observer(({ isOpen, onClose }) => {
  const { settingsStore } = useStores();
  const [isClosing, setIsClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [version, setVersion] = useState<string>('');

  // Translation hooks
  const settingsText = useTranslation('settings', settingsStore.language, true);
  const languageText = useTranslation('language', settingsStore.language, true);
  const installAppText = useTranslation('installApp', settingsStore.language, true);

  useEffect(() => {
    // Get version from service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        if (event.data && event.data.type === 'VERSION_INFO') {
          setVersion(event.data.version);
        }
      };
      navigator.serviceWorker.controller.postMessage(
        { type: 'CHECK_VERSION' },
        [channel.port2]
      );
    }
  }, []);

  useEffect(() => {
    // Only add the event listener if the app is not already installed
    if (!isAppInstalled()) {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

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
        <div className="language-section">
          <h3>{languageText}</h3>
          <select
            value={settingsStore.language}
            onChange={(e) => settingsStore.setLanguage(e.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="ru">Русский</option>
          </select>
        </div>
      </section>

      <div className="bottom-container">
        {deferredPrompt && !isAppInstalled() && (
          <button className="install-button" onClick={handleInstallClick}>
            <span className="material-symbols-outlined">download</span>
            {installAppText}
          </button>
        )}

        <div className="author-section">
          <div>
            <div>Flag Trainer {version && `v${version}`}</div>
            <div>by Michael Frühwirth</div>
          </div>
          <div className="links">
            <a 
              href="https://github.com/fruehwirth/flag-trainer" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <svg className="github-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a 
              href="https://flagtrainer.net" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Website"
            >
              <span className="material-symbols-outlined globe-icon">public</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});