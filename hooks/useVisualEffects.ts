
import { useCallback, useEffect } from 'react';
import { ScaleMapping, Position } from '../scales/types';
import { useParticleSystem } from './useParticleSystem';
import { useStarField } from './useStarField';

export const useVisualEffects = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const { emitParticles: emitParticleSystem, updateAndDrawParticles } = useParticleSystem();
  const { createStars, updateAndDrawStars } = useStarField(canvasRef);
  
  const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const container = canvas?.parentElement;
      if (!canvas || !container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      createStars();
    }, [canvasRef, createStars]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, [resizeCanvas]);

  const emitParticles = useCallback((x: number, y: number, volume: number, noteIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    emitParticleSystem(x, y, volume, noteIndex, canvas);
  }, [canvasRef, emitParticleSystem]);

  const drawVisuals = useCallback((
    scaleMapping: ScaleMapping | null,
    scaleSlice: number[],
    minNoteIndex: number,
    activePosition?: Position,
    showGrid?: boolean
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    // Clear the canvas to make it transparent, allowing the CSS background image to show through.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scale visualization first, so it's in the background
    if (scaleMapping) {
      scaleMapping.visualize(ctx, scaleSlice, minNoteIndex, activePosition, showGrid);
    }

    // Draw stars
    updateAndDrawStars(ctx, canvas);
    
    // Draw and update particles
    updateAndDrawParticles(ctx, canvas);
  }, [canvasRef, updateAndDrawStars, updateAndDrawParticles]);

  return { emitParticles, drawVisuals, resizeCanvas };
};
