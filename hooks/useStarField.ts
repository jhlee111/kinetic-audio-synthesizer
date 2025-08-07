import { useRef, useCallback, useEffect } from 'react';
import type { Particle } from '../types';

const STAR_COUNT = 300;

export const useStarField = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
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

  const updateAndDrawStars = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const focalLength = canvas.width / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

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
  }, []);

  return { createStars, updateAndDrawStars };
};