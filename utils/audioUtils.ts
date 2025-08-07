import type { Landmark } from '../types';

// This state is managed outside the function to allow for smoothing across calls.
let smoothedGain = 0;

export const processHandDataForGain = (landmarks: Landmark[]) => {
  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];

  const dx = thumbTip.x - indexTip.x;
  const dy = thumbTip.y - indexTip.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  const minDistance = 0.03; 
  const maxDistance = 0.25; 
  const rawGain = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)));

  // Apply linear interpolation (LERP) for smoothing to prevent audio glitches
  const LERP_FACTOR = 0.4;
  smoothedGain += LERP_FACTOR * (rawGain - smoothedGain);
  
  return smoothedGain;
};

export const resetAudioSmoothening = () => {
  smoothedGain = 0;
}
