import { useState, useEffect, useCallback } from 'react';
import { UserConfig, DEFAULT_CONFIG } from '../types/config';
import { InstrumentName } from '../services/audioService';
import { ScaleMappingId } from '../scales';

const STORAGE_KEY = 'kinetic-audio-synthesizer-config';

interface UseUserConfigReturn {
  config: UserConfig;
  updateConfig: (updates: Partial<UserConfig>) => void;
  resetConfig: () => void;
  
  // Convenience methods for common updates
  setInstrument: (instrument: InstrumentName) => void;
  setScale: (scaleId: ScaleMappingId) => void;
  setNoteRange: (min: number, max: number) => void;
  setShowGrid: (show: boolean) => void;
  setBackground: (imageUrl: string, isCustom?: boolean) => void;
  setSearchQuery: (query: string) => void;
  setParticleCount: (count: number) => void;
}

// Config validation and migration
const validateAndMigrateConfig = (stored: any): UserConfig => {
  if (!stored || typeof stored !== 'object') {
    return DEFAULT_CONFIG;
  }

  // Start with defaults and overlay stored values
  const config: UserConfig = { ...DEFAULT_CONFIG };
  
  // Validate and migrate each field
  if (typeof stored.instrument === 'string') config.instrument = stored.instrument;
  if (typeof stored.scaleId === 'string') config.scaleId = stored.scaleId;
  if (typeof stored.minNoteIndex === 'number') config.minNoteIndex = stored.minNoteIndex;
  if (typeof stored.maxNoteIndex === 'number') config.maxNoteIndex = stored.maxNoteIndex;
  if (typeof stored.showGrid === 'boolean') config.showGrid = stored.showGrid;
  if (typeof stored.currentBackgroundImage === 'string') config.currentBackgroundImage = stored.currentBackgroundImage;
  if (typeof stored.isUsingCustomBackground === 'boolean') config.isUsingCustomBackground = stored.isUsingCustomBackground;
  if (typeof stored.lastUsedSearchQuery === 'string') config.lastUsedSearchQuery = stored.lastUsedSearchQuery;
  if (typeof stored.particleCount === 'number') config.particleCount = Math.max(0.1, Math.min(5.0, stored.particleCount));
  
  // Always update version
  config.version = DEFAULT_CONFIG.version;
  
  return config;
};

export const useUserConfig = (): UseUserConfigReturn => {
  const [config, setConfig] = useState<UserConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return validateAndMigrateConfig(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load user config from localStorage:', error);
    }
    return DEFAULT_CONFIG;
  });

  // Persist config to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save user config to localStorage:', error);
    }
  }, [config]);

  const updateConfig = useCallback((updates: Partial<UserConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...updates
    }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  // Convenience methods
  const setInstrument = useCallback((instrument: InstrumentName) => {
    updateConfig({ instrument });
  }, [updateConfig]);

  const setScale = useCallback((scaleId: ScaleMappingId) => {
    updateConfig({ scaleId });
  }, [updateConfig]);

  const setNoteRange = useCallback((minNoteIndex: number, maxNoteIndex: number) => {
    updateConfig({ minNoteIndex, maxNoteIndex });
  }, [updateConfig]);

  const setShowGrid = useCallback((showGrid: boolean) => {
    updateConfig({ showGrid });
  }, [updateConfig]);

  const setBackground = useCallback((currentBackgroundImage: string, isUsingCustomBackground = true) => {
    updateConfig({ 
      currentBackgroundImage, 
      isUsingCustomBackground 
    });
  }, [updateConfig]);

  const setSearchQuery = useCallback((lastUsedSearchQuery: string) => {
    updateConfig({ lastUsedSearchQuery });
  }, [updateConfig]);

  const setParticleCount = useCallback((particleCount: number) => {
    // Clamp between 0.1 and 5.0
    const clampedCount = Math.max(0.1, Math.min(5.0, particleCount));
    updateConfig({ particleCount: clampedCount });
  }, [updateConfig]);

  return {
    config,
    updateConfig,
    resetConfig,
    setInstrument,
    setScale,
    setNoteRange,
    setShowGrid,
    setBackground,
    setSearchQuery,
    setParticleCount
  };
};