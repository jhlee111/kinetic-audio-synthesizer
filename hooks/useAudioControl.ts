import { useState, useCallback, useEffect } from 'react';
import { audioService, InstrumentName } from '../services/audioService';
import { processHandDataForGain, resetAudioSmoothening } from '../utils/audioUtils';
import { scaleMappings, ScaleMappingId } from '../scales';
import { MASTER_PENTATONIC_SCALE } from '../constants';
import { Position } from '../scales/types';
import { useUserConfig } from './useUserConfig';

interface UseAudioControlReturn {
  currentNote: string;
  currentVolume: number;
  instrument: InstrumentName;
  scaleId: ScaleMappingId;
  handleInstrumentChange: (instrument: InstrumentName) => Promise<void>;
  handleScaleChange: (scaleId: ScaleMappingId) => void;
  processAudio: (position: Position | undefined, landmarks: any, minNoteIndex: number, maxNoteIndex: number) => void;
  initializeAudio: () => Promise<void>;
  stopAudio: () => void;
}

export const useAudioControl = (): UseAudioControlReturn => {
  const { config, setInstrument: saveInstrument, setScale: saveScale } = useUserConfig();
  const [currentNote, setCurrentNote] = useState<string>('--');
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  
  // Use config values
  const instrument = config.instrument;
  const scaleId = config.scaleId;

  const handleInstrumentChange = useCallback(async (newInstrument: InstrumentName) => {
    saveInstrument(newInstrument);
    await audioService.setInstrument(newInstrument);
  }, [saveInstrument]);

  const handleScaleChange = useCallback((newScaleId: ScaleMappingId) => {
    saveScale(newScaleId);
  }, [saveScale]);

  const initializeAudio = useCallback(async () => {
    await audioService.init();
  }, []);

  const stopAudio = useCallback(() => {
    audioService.stop();
  }, []);

  const processAudio = useCallback((
    position: Position | undefined,
    landmarks: any,
    minNoteIndex: number,
    maxNoteIndex: number
  ) => {
    if (position && landmarks) {
      const activeScaleMapping = scaleMappings[scaleId];
      const scaleSlice = MASTER_PENTATONIC_SCALE.slice(minNoteIndex, maxNoteIndex + 1);
      
      const noteData = activeScaleMapping.getNote(position, scaleSlice, minNoteIndex);
      const gain = processHandDataForGain(landmarks);

      if (noteData) {
        audioService.update(noteData.frequency, gain);
        setCurrentNote(noteData.noteName);
        setCurrentVolume(Math.round(gain * 100));
      }
    } else {
      audioService.rampToGain(0, 0.1);
      resetAudioSmoothening();
      setCurrentNote('--');
      setCurrentVolume(0);
    }
  }, [scaleId]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    currentNote,
    currentVolume,
    instrument,
    scaleId,
    handleInstrumentChange,
    handleScaleChange,
    processAudio,
    initializeAudio,
    stopAudio
  };
};