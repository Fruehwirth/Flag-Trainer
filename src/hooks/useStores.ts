import React from 'react';
import { GameStore } from '../stores/GameStore';
import { SettingsStore } from '../stores/SettingsStore';

interface StoresContext {
  gameStore: GameStore;
  settingsStore: SettingsStore;
}

const storesContext = React.createContext<StoresContext | null>(null);

let stores: StoresContext | null = null;

const initializeStores = () => {
  if (!stores) {
    const settingsStore = new SettingsStore();
    const gameStore = new GameStore(settingsStore);
    stores = { gameStore, settingsStore };
  }
  return stores;
};

export const StoresProvider = ({ children }: { children: React.ReactNode }) => {
  const [storeInstance] = React.useState(initializeStores);

  return React.createElement(
    storesContext.Provider,
    { value: storeInstance },
    children
  );
};

export const useStores = (): StoresContext => {
  const context = React.useContext(storesContext);
  if (!context) {
    console.error('No StoresProvider found in component tree');
    throw new Error('useStores must be used within a StoresProvider');
  }
  return context;
};