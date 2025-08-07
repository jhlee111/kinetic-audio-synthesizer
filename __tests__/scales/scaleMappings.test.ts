import { scaleMappings } from '../../scales';
import { MASTER_PENTATONIC_SCALE } from '../../constants';

describe('Scale Mappings', () => {
  const testPosition = { x: 0.5, y: 0.5 };
  const testScale = MASTER_PENTATONIC_SCALE.slice(10, 20);
  const minNoteIndex = 10;

  describe('All scale mappings', () => {
    Object.entries(scaleMappings).forEach(([scaleId, mapping]) => {
      describe(scaleId, () => {
        it('should have required methods', () => {
          expect(mapping.getNote).toBeDefined();
          expect(mapping.visualize).toBeDefined();
          expect(typeof mapping.getNote).toBe('function');
          expect(typeof mapping.visualize).toBe('function');
        });

        it('should return valid note data for center position', () => {
          const noteData = mapping.getNote(testPosition, testScale, minNoteIndex);
          
          if (noteData) {
            expect(noteData.frequency).toBeGreaterThan(0);
            expect(noteData.noteName).toBeTruthy();
            expect(typeof noteData.noteName).toBe('string');
            expect(noteData.noteIndex).toBeGreaterThanOrEqual(0);
          }
        });

        it('should handle edge positions without crashing', () => {
          const edgePositions = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: 1, y: 0 }
          ];

          edgePositions.forEach(position => {
            expect(() => {
              mapping.getNote(position, testScale, minNoteIndex);
            }).not.toThrow();
          });
        });

        it('should handle empty scale gracefully', () => {
          expect(() => {
            mapping.getNote(testPosition, [], minNoteIndex);
          }).not.toThrow();
        });

        it('should not crash when visualizing', () => {
          const mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            rect: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            closePath: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            rotate: jest.fn(),
            setTransform: jest.fn(),
            resetTransform: jest.fn(),
            globalAlpha: 1,
            font: '10px Arial',
            textAlign: 'center',
            fillText: jest.fn()
          } as any;

          expect(() => {
            mapping.visualize(mockCtx, testScale, minNoteIndex, testPosition, true);
          }).not.toThrow();

          expect(() => {
            mapping.visualize(mockCtx, testScale, minNoteIndex, undefined, false);
          }).not.toThrow();
        });
      });
    });
  });

  describe('Scale mapping consistency', () => {
    it('should return consistent results for same input', () => {
      const mapping = scaleMappings.grid_wfc;
      const result1 = mapping.getNote(testPosition, testScale, minNoteIndex);
      const result2 = mapping.getNote(testPosition, testScale, minNoteIndex);
      
      if (result1 && result2) {
        expect(result1.frequency).toBe(result2.frequency);
        expect(result1.noteName).toBe(result2.noteName);
        expect(result1.noteIndex).toBe(result2.noteIndex);
      }
    });
  });
});