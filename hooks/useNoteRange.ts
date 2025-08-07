import { useCallback } from 'react';
import { useUserConfig } from './useUserConfig';

interface UseNoteRangeReturn {
  minNoteIndex: number;
  maxNoteIndex: number;
  setMinNoteIndex: (index: number) => void;
  setMaxNoteIndex: (index: number) => void;
}

export const useNoteRange = (): UseNoteRangeReturn => {
  const { config, setNoteRange } = useUserConfig();
  
  // Get values from config
  const minNoteIndex = config.minNoteIndex;
  const maxNoteIndex = config.maxNoteIndex;

  const handleSetMinNoteIndex = useCallback((index: number) => {
    setNoteRange(index, maxNoteIndex);
  }, [maxNoteIndex, setNoteRange]);

  const handleSetMaxNoteIndex = useCallback((index: number) => {
    setNoteRange(minNoteIndex, index);
  }, [minNoteIndex, setNoteRange]);

  return {
    minNoteIndex,
    maxNoteIndex,
    setMinNoteIndex: handleSetMinNoteIndex,
    setMaxNoteIndex: handleSetMaxNoteIndex
  };
};