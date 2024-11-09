import React from 'react';
import { GameStore } from '../stores/GameStore';
import { SettingsStore } from '../stores/SettingsStore';

interface StoresContext {
  gameStore: GameStore;
  settingsStore: SettingsStore;
}

const storesContext = React.createContext<StoresContext | null>(null);

export const StoresProvider = ({ children }: { children: React.ReactNode }) => {
  // Create stores only once and persist them
  const [stores] = React.useState(() => {
    const settingsStore = new SettingsStore();
    const gameStore = new GameStore(settingsStore);
    return {
      gameStore,
      settingsStore,
    };
  });

  return React.createElement(storesContext.Provider, { value: stores }, children);
};

export const useStores = () => {
  const stores = React.useContext(storesContext);
  if (!stores) {
    throw new Error('useStores must be used within a StoresProvider');
  }
  return stores;
};