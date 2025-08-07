export interface GridDimensions {
  cols: number;
  rows: number;
}

export const getResponsiveGridDimensions = (canvasWidth?: number, canvasHeight?: number): GridDimensions => {
  const width = canvasWidth || window.innerWidth;
  const height = canvasHeight || window.innerHeight;
  const aspectRatio = width / height;
  const isMobile = window.innerWidth < 768;
  
  // For mobile devices
  if (isMobile) {
    // Calculate based on a target cell size that works well for touch
    const targetCellSize = Math.min(width, height) / 5;
    const cols = Math.ceil(width / targetCellSize);
    const rows = Math.ceil(height / targetCellSize);
    return { cols, rows };
  } 
  
  // For desktop
  const targetCellSize = Math.min(width, height) / 7;
  const cols = Math.ceil(width / targetCellSize);
  const rows = Math.ceil(height / targetCellSize);
  return { cols, rows };
};

export const calculateSquareCellSize = (canvasWidth: number, canvasHeight: number, cols: number, rows: number) => {
  // Calculate the exact cell size needed to fill the viewport
  const cellSize = Math.max(canvasWidth / cols, canvasHeight / rows);
  
  // No offset - fill the entire viewport
  return {
    cellSize,
    actualCols: cols,
    actualRows: rows,
    offsetX: 0,
    offsetY: 0
  };
};