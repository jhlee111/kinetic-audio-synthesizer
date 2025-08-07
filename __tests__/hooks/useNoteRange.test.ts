import { renderHook, act } from '@testing-library/react';
import { useNoteRange } from '../../hooks/useNoteRange';

describe('useNoteRange', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useNoteRange());
    
    expect(result.current.minNoteIndex).toBe(10); // C4
    expect(result.current.maxNoteIndex).toBe(30); // C6
  });

  it('should update min note index', () => {
    const { result } = renderHook(() => useNoteRange());
    
    act(() => {
      result.current.setMinNoteIndex(15);
    });
    
    expect(result.current.minNoteIndex).toBe(15);
    expect(result.current.maxNoteIndex).toBe(30); // Should not change
  });

  it('should update max note index', () => {
    const { result } = renderHook(() => useNoteRange());
    
    act(() => {
      result.current.setMaxNoteIndex(25);
    });
    
    expect(result.current.minNoteIndex).toBe(10); // Should not change
    expect(result.current.maxNoteIndex).toBe(25);
  });

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => useNoteRange());
    
    const setMinNoteIndex1 = result.current.setMinNoteIndex;
    const setMaxNoteIndex1 = result.current.setMaxNoteIndex;
    
    rerender();
    
    expect(result.current.setMinNoteIndex).toBe(setMinNoteIndex1);
    expect(result.current.setMaxNoteIndex).toBe(setMaxNoteIndex1);
  });
});