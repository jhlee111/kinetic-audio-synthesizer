
import { Landmark } from '../types';

export interface Position {
  x: number;
  y: number;
}

export interface NoteData {
  frequency: number;
  noteName: string;
  noteIndex: number;
}

export interface ScaleMapping {
  id: string;
  name: string;
  getNote(position: Position, scale: number[], minNoteIndex: number): NoteData | null;
  visualize(ctx: CanvasRenderingContext2D, scale: number[], minNoteIndex: number, activePosition?: Position, showGrid?: boolean): void;
  regenerate?: () => void;
  hasGridVisualization?: boolean;
}
