import { useRef, useCallback } from 'react';
import type { Particle } from '../types';
import { NOTE_COLORS } from '../constants';
import { useUserConfig } from './useUserConfig';

export const useParticleSystem = () => {
  const { config } = useUserConfig();
  const particlesRef = useRef<Particle[]>([]);

  const emitParticles = useCallback((x: number, y: number, volume: number, noteIndex: number, canvas: HTMLCanvasElement) => {
    const baseParticleCount = Math.ceil(volume * 5);
    const particleCount = Math.ceil(baseParticleCount * config.particleCount);
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
  }, [config.particleCount]);

  const updateAndDrawParticles = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const focalLength = canvas.width / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

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
  }, []);

  return { emitParticles, updateAndDrawParticles };
};