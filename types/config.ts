import { InstrumentName } from '../services/audioService';
import { ScaleMappingId } from '../scales';

export interface UserConfig {
  // Audio settings
  instrument: InstrumentName;
  scaleId: ScaleMappingId;
  minNoteIndex: number;
  maxNoteIndex: number;
  
  // Visual settings
  showGrid: boolean;
  currentBackgroundImage: string;
  isUsingCustomBackground: boolean;
  
  // UI preferences
  lastUsedSearchQuery: string;
  
  // Performance settings
  particleCount: number; // Multiplier for particle effects (0.5 = half, 2.0 = double)
  
  // Version for config migration
  version: string;
}

export const DEFAULT_CONFIG: UserConfig = {
  instrument: 'starlight',
  scaleId: 'grid_wfc',
  minNoteIndex: 10, // C4
  maxNoteIndex: 30, // C6
  showGrid: false,
  currentBackgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
  isUsingCustomBackground: false,
  lastUsedSearchQuery: 'space nebula galaxy',
  particleCount: 1.0,
  version: '1.0'
};