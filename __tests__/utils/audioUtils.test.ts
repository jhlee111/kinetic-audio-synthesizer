import { processHandDataForGain, resetAudioSmoothening } from '../../utils/audioUtils';

describe('audioUtils', () => {
  describe('processHandDataForGain', () => {
    it('should return 0 for empty landmarks', () => {
      const result = processHandDataForGain([]);
      expect(result).toBe(0);
    });

    it('should return 0 for insufficient landmarks', () => {
      const result = processHandDataForGain([{ x: 0.5, y: 0.5, z: 0 }]);
      expect(result).toBe(0);
    });

    it('should calculate gain based on hand closure', () => {
      const landmarks = Array.from({ length: 21 }, (_, i) => ({
        x: i % 2 === 0 ? 0.5 : 0.6, // Simulate some hand closure
        y: 0.5,
        z: 0
      }));
      
      const result = processHandDataForGain(landmarks);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should clamp gain between 0 and 1', () => {
      // Create landmarks with extreme values to test clamping
      const landmarks = Array.from({ length: 21 }, () => ({
        x: 10, // Extreme value
        y: 10,
        z: 10
      }));
      
      const result = processHandDataForGain(landmarks);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('resetAudioSmoothening', () => {
    it('should not throw when called', () => {
      expect(() => resetAudioSmoothening()).not.toThrow();
    });
  });
});