import { useState, useCallback, useEffect } from 'react';
import { audioService, InstrumentName } from '../services/audioService';
import { processHandDataForGain, resetAudioSmoothening } from '../utils/audioUtils';
import { scaleMappings, ScaleMappingId } from '../scales';
import { MASTER_PENTATONIC_SCALE } from '../constants';
import { Position } from '../scales/types';

interface UseAudioControlReturn {
  currentNote: string;
  currentVolume: number;
  instrument: InstrumentName;
  scaleId: ScaleMappingId;
  handleInstrumentChange: (instrument: InstrumentName) => void;
  handleScaleChange: (scaleId: ScaleMappingId) => void;
  processAudio: (position: Position | undefined, landmarks: any, minNoteIndex: number, maxNoteIndex: number) => void;
  initializeAudio: () => Promise<void>;
  stopAudio: () => void;
}

export const useAudioControl = (): UseAudioControlReturn => {
  const [currentNote, setCurrentNote] = useState<string>('--');
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [instrument, setInstrument] = useState<InstrumentName>('starlight');
  const [scaleId, setScaleId] = useState<ScaleMappingId>('grid_wfc');

  const handleInstrumentChange = useCallback((newInstrument: InstrumentName) => {
    setInstrument(newInstrument);
    audioService.setInstrument(newInstrument);
  }, []);

  const handleScaleChange = useCallback((newScaleId: ScaleMappingId) => {
    setScaleId(newScaleId);
  }, []);

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