
import { ScaleMapping, Position, NoteData } from './types';
import { NOTE_NAMES, NOTE_COLORS } from '../constants';
import { generateWfcGrid } from './waveFunctionCollapse';
import { getResponsiveGridDimensions, calculateSquareCellSize } from '../utils/responsiveGrid';

let memoizedGrid: number[][] | null = null;
let memoizedNoteCount = -1;
let memoizedDimensions = { cols: -1, rows: -1 };

/**
 * Ensures the WFC grid is generated and memoized.
 * It regenerates the grid if the number of notes in the scale changes,
 * if the grid dimensions change, or if the grid hasn't been created yet.
 */
const getOrCreateGrid = (noteCount: number, cols: number, rows: number): number[][] => {
  if (!memoizedGrid || noteCount !== memoizedNoteCount || 
      cols !== memoizedDimensions.cols || rows !== memoizedDimensions.rows) {
    let newGrid: number[][] | null = null;
    let attempts = 0;
    // WFC can fail, so we retry a few times if it returns null.
    while (!newGrid && attempts < 5) {
        newGrid = generateWfcGrid(rows, cols, noteCount);
        attempts++;
    }
    if (!newGrid) {
        // If it still fails, fallback to a simple grid to avoid crashing.
        console.error("WFC failed after multiple attempts. Falling back to simple grid.");
        newGrid = Array.from({ length: rows }, (_, r) => 
            Array.from({ length: cols }, (_, c) => (r * cols + c) % noteCount)
        );
    }

    memoizedGrid = newGrid;
    memoizedNoteCount = noteCount;
    memoizedDimensions = { cols, rows };
  }
  return memoizedGrid;
};

/**
 * Calculates the note, column, and row for a given screen position.
 */
const getGridData = (position: Position, scale: number[], minNoteIndex: number) => {
  // Use window dimensions to determine grid size
  const { cols, rows } = getResponsiveGridDimensions();
  const grid = getOrCreateGrid(scale.length, cols, rows);
  
  // Position is normalized 0-1, so we can directly map to grid
  const col = Math.max(0, Math.min(Math.floor(position.x * cols), cols - 1));
  const row = Math.max(0, Math.min(Math.floor(position.y * rows), rows - 1));
  
  const relativeNoteIndex = grid[row][col];
  const frequency = scale[relativeNoteIndex];
  
  const absoluteNoteIndex = minNoteIndex + relativeNoteIndex;
  const noteName = NOTE_NAMES[absoluteNoteIndex % NOTE_NAMES.length];

  const noteData: NoteData = { frequency, noteName, noteIndex: absoluteNoteIndex };

  return { noteData, col, row, actualCols: cols, actualRows: rows };
};

export const gridScale: ScaleMapping = {
  id: 'grid_wfc',
  name: 'Chaos Grid',
  hasGridVisualization: true,
  regenerate: () => {
    memoizedGrid = null;
    memoizedDimensions = { cols: -1, rows: -1 };
  },
  getNote: (position: Position, scale: number[], minNoteIndex: number): NoteData | null => {
    if (scale.length < 3) return null; // WFC needs at least 3 notes for the constraint to be meaningful
    const result = getGridData(position, scale, minNoteIndex);
    return result ? result.noteData : null;
  },
  visualize: (ctx: CanvasRenderingContext2D, scale: number[], minNoteIndex: number, activePosition?: Position, showGrid?: boolean): void => {
    if (showGrid === false) return;
    if (scale.length < 3) return;

    const { width, height } = ctx.canvas;
    const { cols, rows } = getResponsiveGridDimensions(width, height);
    const grid = getOrCreateGrid(scale.length, cols, rows);
    const { cellSize, actualCols, actualRows, offsetX, offsetY } = calculateSquareCellSize(width, height, cols, rows);

    // Draw background cell colors - fill entire viewport
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const relativeNoteIndex = grid[r][c];
            const absoluteNoteIndex = minNoteIndex + relativeNoteIndex;
            const color = NOTE_COLORS[absoluteNoteIndex % NOTE_COLORS.length];
            ctx.fillStyle = `${color}1A`; // Faint background color
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
    }

    // Highlight the active cell
    if (activePosition) {
      const col = Math.floor(activePosition.x * cols);
      const row = Math.floor(activePosition.y * rows);
      
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        const relativeNoteIndex = grid[row][col];
        const absoluteNoteIndex = minNoteIndex + relativeNoteIndex;
        const color = NOTE_COLORS[absoluteNoteIndex % NOTE_COLORS.length];
        ctx.fillStyle = `${color}40`; // Brighter highlight
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }
  },
};
