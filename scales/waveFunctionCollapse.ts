// A simplified Wave Function Collapse implementation for generating a 2D grid of notes.

/**
 * Picks a random element from an array.
 */
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Finds the cell with the minimum entropy (fewest possible states) that has not been collapsed yet.
 * @returns [row, col] of the cell with the lowest entropy, or null if all cells are collapsed.
 */
const findCellWithLowestEntropy = (
  possibilitiesGrid: number[][][],
  collapsedGrid: boolean[][]
): [number, number] | null => {
  let minEntropy = Infinity;
  let minEntropyCells: [number, number][] = [];
  const rows = possibilitiesGrid.length;
  const cols = possibilitiesGrid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!collapsedGrid[r][c]) {
        const entropy = possibilitiesGrid[r][c].length;
        if (entropy < minEntropy) {
          minEntropy = entropy;
          minEntropyCells = [[r, c]];
        } else if (entropy === minEntropy) {
          minEntropyCells.push([r, c]);
        }
      }
    }
  }

  if (minEntropyCells.length === 0) {
    return null; // All cells collapsed
  }

  return getRandomElement(minEntropyCells);
};

/**
 * Generates a 2D grid of note indices using a Wave Function Collapse algorithm.
 * Each cell's note will be at most 2 steps away from its neighbors in the scale, but not identical.
 *
 * @param rows The number of rows in the grid.
 * @param cols The number of columns in the grid.
 * @param noteCount The total number of available notes in the scale.
 * @returns A 2D array representing the grid of note indices, or null if a solution couldn't be found.
 */
export const generateWfcGrid = (rows: number, cols: number, noteCount: number): number[][] | null => {
  // 1. Initialize grids
  const initialPossibilities = Array.from({ length: noteCount }, (_, i) => i);
  const possibilitiesGrid: number[][][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [...initialPossibilities])
  );
  const collapsedGrid: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const finalGrid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(-1));

  // Main WFC loop
  while (true) {
    // 2. Find the cell with the lowest entropy
    const cellToCollapse = findCellWithLowestEntropy(possibilitiesGrid, collapsedGrid);
    if (!cellToCollapse) {
      break; // All cells are collapsed, we're done
    }

    const [r, c] = cellToCollapse;

    // 3. Collapse the cell
    const possibleNotes = possibilitiesGrid[r][c];
    if (possibleNotes.length === 0) {
      // Contradiction reached, cannot solve.
      // In a real-world scenario, you might implement backtracking here.
      // For this app, we'll return null and the caller can retry.
      console.error("WFC failed: Contradiction found. Retrying might work.");
      return null;
    }
    const chosenNote = getRandomElement(possibleNotes);
    possibilitiesGrid[r][c] = [chosenNote];
    collapsedGrid[r][c] = true;
    finalGrid[r][c] = chosenNote;

    // 4. Propagate constraints
    const propagationStack: [number, number][] = [[r, c]];

    while (propagationStack.length > 0) {
      const [currentRow, currentCol] = propagationStack.pop()!;
      const currentCellPossibilities = possibilitiesGrid[currentRow][currentCol];

      // Get neighbors (up, down, left, right)
      const neighbors = [
        [currentRow - 1, currentCol],
        [currentRow + 1, currentCol],
        [currentRow, currentCol - 1],
        [currentRow, currentCol + 1],
      ];

      for (const [nr, nc] of neighbors) {
        // Check if neighbor is within bounds and not collapsed
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !collapsedGrid[nr][nc]) {
          const neighborPossibilities = possibilitiesGrid[nr][nc];
          const initialNeighborCount = neighborPossibilities.length;

          // Filter neighbor's possibilities based on the current cell's possibilities
          const newNeighborPossibilities = neighborPossibilities.filter(neighborNote =>
            currentCellPossibilities.some(currentNote => {
              const diff = Math.abs(currentNote - neighborNote);
              // Note must be within 2 steps, but not identical.
              return diff > 0 && diff <= 2;
            })
          );

          // If we removed possibilities, update the grid and add neighbor to stack
          if (newNeighborPossibilities.length < initialNeighborCount) {
            possibilitiesGrid[nr][nc] = newNeighborPossibilities;
            propagationStack.push([nr, nc]);
          }
        }
      }
    }
  }

  return finalGrid;
};
