import { useState, useCallback } from 'react';

interface UseNoteRangeReturn {
  minNoteIndex: number;
  maxNoteIndex: number;
  setMinNoteIndex: (index: number) => void;
  setMaxNoteIndex: (index: number) => void;
}

export const useNoteRange = (): UseNoteRangeReturn => {
  const [minNoteIndex, setMinNoteIndex] = useState(10); // Start at C4
  const [maxNoteIndex, setMaxNoteIndex] = useState(30); // End at C6

  const handleSetMinNoteIndex = useCallback((index: number) => {
    setMinNoteIndex(index);
  }, []);

  const handleSetMaxNoteIndex = useCallback((index: number) => {
    setMaxNoteIndex(index);
  }, []);

  return {
    minNoteIndex,
    maxNoteIndex,
    setMinNoteIndex: handleSetMinNoteIndex,
    setMaxNoteIndex: handleSetMaxNoteIndex
  };
};