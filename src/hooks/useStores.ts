import React from 'react';
import { GameStore } from '../stores/GameStore';
import { SettingsStore } from '../stores/SettingsStore';

interface StoresContext {
  gameStore: GameStore;
  settingsStore: SettingsStore;
}

const storesContext = React.createContext<StoresContext | null>(null);

export const StoresProvider = ({ children }: { children: React.ReactNode }) => {
  const settingsStore = React.useMemo(() => new SettingsStore(), []);
  const gameStore = React.useMemo(() => new GameStore(settingsStore), [settingsStore]);

  const stores = React.useMemo(
    () => ({
      gameStore,
      settingsStore,
    }),
    [gameStore, settingsStore]
  );

  return React.createElement(storesContext.Provider, { value: stores }, children);
};

export const useStores = () => {
  const stores = React.useContext(storesContext);
  if (!stores) {
    throw new Error('useStores must be used within a StoresProvider');
  }
  return stores;
};