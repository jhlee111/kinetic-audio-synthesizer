
import { ScaleMapping, Position, NoteData } from './types';
import { NOTE_NAMES, NOTE_COLORS } from '../constants';

const getNoteData = (position: Position, scale: number[], minNoteIndex: number): NoteData => {
  const pitchValue = 1 - Math.max(0, Math.min(1, position.y));
  let relativeNoteIndex = Math.floor(pitchValue * scale.length);
  relativeNoteIndex = Math.min(relativeNoteIndex, scale.length - 1);

  const frequency = scale[relativeNoteIndex];
  // The absolute index is used for consistent color and note name mapping across the master scale
  const absoluteNoteIndex = minNoteIndex + relativeNoteIndex;
  const noteName = NOTE_NAMES[absoluteNoteIndex % NOTE_NAMES.length];

  return { frequency, noteName, noteIndex: absoluteNoteIndex };
};

export const verticalPentatonic: ScaleMapping = {
  id: 'vertical',
  name: 'Vertical',
  hasGridVisualization: true,
  getNote: (position: Position, scale: number[], minNoteIndex: number): NoteData | null => {
    if (scale.length === 0) return null;
    return getNoteData(position, scale, minNoteIndex);
  },
  visualize: (ctx: CanvasRenderingContext2D, scale: number[], minNoteIndex: number, activePosition?: Position, showGrid?: boolean): void => {
    // If showGrid is explicitly false, do not render the visualization.
    if (showGrid === false) return;
    if (scale.length === 0) return;
    
    const { width, height } = ctx.canvas;
    const numNotes = scale.length;
    const bandHeight = height / numNotes;

    // Highlight active band
    if (activePosition) {
      const { noteIndex } = getNoteData(activePosition, scale, minNoteIndex);
      const color = NOTE_COLORS[noteIndex % NOTE_COLORS.length];
      ctx.fillStyle = `${color}20`; // Add alpha for transparency
      ctx.fillRect(0, height - ((noteIndex - minNoteIndex) + 1) * bandHeight, width, bandHeight);
    }

    // Draw lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 1; i < numNotes; i++) {
      const y = i * bandHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  },
};
