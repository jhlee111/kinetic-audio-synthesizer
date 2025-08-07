
import { ScaleMapping, Position, NoteData } from './types';
import { NOTE_NAMES, NOTE_COLORS } from '../constants';
import { generateWfcGrid } from './waveFunctionCollapse';

const COLS = 10;
const ROWS = 7;

let memoizedGrid: number[][] | null = null;
let memoizedNoteCount = -1;

/**
 * Ensures the WFC grid is generated and memoized.
 * It regenerates the grid if the number of notes in the scale changes
 * or if the grid hasn't been created yet.
 */
const getOrCreateGrid = (noteCount: number): number[][] => {
  if (!memoizedGrid || noteCount !== memoizedNoteCount) {
    let newGrid: number[][] | null = null;
    let attempts = 0;
    // WFC can fail, so we retry a few times if it returns null.
    while (!newGrid && attempts < 5) {
        newGrid = generateWfcGrid(ROWS, COLS, noteCount);
        attempts++;
    }
    if (!newGrid) {
        // If it still fails, fallback to a simple grid to avoid crashing.
        console.error("WFC failed after multiple attempts. Falling back to simple grid.");
        newGrid = Array.from({ length: ROWS }, (_, r) => 
            Array.from({ length: COLS }, (_, c) => (r * COLS + c) % noteCount)
        );
    }

    memoizedGrid = newGrid;
    memoizedNoteCount = noteCount;
  }
  return memoizedGrid;
};

/**
 * Calculates the note, column, and row for a given screen position.
 */
const getGridData = (position: Position, scale: number[], minNoteIndex: number) => {
  const grid = getOrCreateGrid(scale.length);
  
  const col = Math.max(0, Math.min(Math.floor(position.x * COLS), COLS - 1));
  const row = Math.max(0, Math.min(Math.floor(position.y * ROWS), ROWS - 1));
  
  const relativeNoteIndex = grid[row][col];
  const frequency = scale[relativeNoteIndex];
  
  const absoluteNoteIndex = minNoteIndex + relativeNoteIndex;
  const noteName = NOTE_NAMES[absoluteNoteIndex % NOTE_NAMES.length];

  const noteData: NoteData = { frequency, noteName, noteIndex: absoluteNoteIndex };

  return { noteData, col, row };
};

export const gridScale: ScaleMapping = {
  id: 'grid_wfc',
  name: 'Chaos Grid',
  hasGridVisualization: true,
  regenerate: () => {
    memoizedGrid = null;
  },
  getNote: (position: Position, scale: number[], minNoteIndex: number): NoteData | null => {
    if (scale.length < 3) return null; // WFC needs at least 3 notes for the constraint to be meaningful
    return getGridData(position, scale, minNoteIndex).noteData;
  },
  visualize: (ctx: CanvasRenderingContext2D, scale: number[], minNoteIndex: number, activePosition?: Position, showGrid?: boolean): void => {
    if (showGrid === false) return;
    if (scale.length < 3) return;

    const grid = getOrCreateGrid(scale.length);
    const { width, height } = ctx.canvas;
    const cellWidth = width / COLS;
    const cellHeight = height / ROWS;

    // Draw background cell colors
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const relativeNoteIndex = grid[r][c];
            const absoluteNoteIndex = minNoteIndex + relativeNoteIndex;
            const color = NOTE_COLORS[absoluteNoteIndex % NOTE_COLORS.length];
            ctx.fillStyle = `${color}1A`; // Faint background color
            ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
        }
    }

    // Highlight the active cell
    if (activePosition) {
      const { noteData, col, row } = getGridData(activePosition, scale, minNoteIndex);
      const color = NOTE_COLORS[noteData.noteIndex % NOTE_COLORS.length];
      ctx.fillStyle = `${color}40`; // Brighter highlight
      ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 1; i < COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, height);
      ctx.stroke();
    }
    for (let i = 1; i < ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
      ctx.stroke();
    }
  },
};
