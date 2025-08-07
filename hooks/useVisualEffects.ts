
import { useRef, useCallback, useEffect } from 'react';
import type { Particle } from '../types';
import { NOTE_COLORS } from '../constants';
import { ScaleMapping, Position } from '../scales/types';

const STAR_COUNT = 300;

export const useVisualEffects = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Particle[]>([]);

  const createStars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newStars: Particle[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        newStars.push({
            x: (Math.random() - 0.5) * canvas.width * 2,
            y: (Math.random() - 0.5) * canvas.height * 2,
            z: Math.random() * canvas.width,
            vz: -0.2,
            size: Math.random() * 2,
            color: 'rgba(255, 255, 255, 0.8)',
            life: Infinity,
            vx: 0,
            vy: 0,
        });
    }
    starsRef.current = newStars;
  }, [canvasRef]);
  
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

    const particleCount = Math.ceil(volume * 5);
    const noteColor = NOTE_COLORS[noteIndex % NOTE_COLORS.length];
    
    const startX = (x * canvas.width) - (canvas.width / 2);
    const startY = (y * canvas.height) - (canvas.height / 2);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 20 * volume;
      particlesRef.current.push({
        x: startX + Math.cos(angle) * radius,
        y: startY + Math.sin(angle) * radius,
        z: 0,
        vz: 2 + volume * 5,
        size: 1 + volume * 3,
        color: noteColor,
        life: 80 + Math.random() * 40,
        vx: 0,
        vy: 0,
      });
    }
  }, [canvasRef]);

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

    const focalLength = canvas.width / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear the canvas to make it transparent, allowing the CSS background image to show through.
    // The previous method of filling with a semi-transparent black created nice trails
    // but obscured the background, which is undesirable.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scale visualization first, so it's in the background
    if (scaleMapping) {
      scaleMapping.visualize(ctx, scaleSlice, minNoteIndex, activePosition, showGrid);
    }

    // Draw stars
    starsRef.current.forEach(star => {
      star.z += star.vz;
      if (star.z < 1) {
        star.z = canvas.width;
        star.x = (Math.random() - 0.5) * canvas.width * 2;
        star.y = (Math.random() - 0.5) * canvas.height * 2;
      }
      const scale = focalLength / (focalLength - star.z);
      const projX = star.x * scale + centerX;
      const projY = star.y * scale + centerY;
      const projSize = star.size * scale;
      if (projX > 0 && projX < canvas.width && projY > 0 && projY < canvas.height && scale > 0) {
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw and update particles
    particlesRef.current = particlesRef.current.filter(p => {
        p.z += p.vz;
        p.life -= 1;
        if (p.life <= 0) return false;

        const scale = focalLength / (focalLength + p.z);
        if (scale <= 0) return false;

        const projX = p.x * scale + centerX;
        const projY = p.y * scale + centerY;
        const projSize = p.size * scale;
        if (projSize < 0.1 || projX < 0 || projX > canvas.width || projY < 0 || projY > canvas.height) {
            return false;
        }
        
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, p.life / 60) * (scale * 1.5);
        ctx.beginPath();
        ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
    });
  }, [canvasRef]);

  return { emitParticles, drawVisuals, resizeCanvas };
};
