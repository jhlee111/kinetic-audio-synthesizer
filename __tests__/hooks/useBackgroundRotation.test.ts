import { renderHook, act } from '@testing-library/react';
import { useBackgroundRotation } from '../../hooks/useBackgroundRotation';

describe('useBackgroundRotation', () => {
  it('should start with first background image', () => {
    const { result } = renderHook(() => useBackgroundRotation());
    
    expect(result.current.currentBackgroundImage).toMatch(/unsplash\.com.*1451187580459/);
  });

  it('should cycle through backgrounds when changeBackground is called', () => {
    const { result } = renderHook(() => useBackgroundRotation());
    
    const firstImage = result.current.currentBackgroundImage;
    
    act(() => {
      result.current.changeBackground();
    });
    
    const secondImage = result.current.currentBackgroundImage;
    expect(secondImage).not.toBe(firstImage);
    expect(secondImage).toMatch(/unsplash\.com.*1534796636912/);
  });

  it('should cycle back to first image after reaching the end', () => {
    const { result } = renderHook(() => useBackgroundRotation());
    
    const firstImage = result.current.currentBackgroundImage;
    
    // Cycle through all 5 images
    act(() => {
      result.current.changeBackground(); // 2nd
      result.current.changeBackground(); // 3rd
      result.current.changeBackground(); // 4th
      result.current.changeBackground(); // 5th
      result.current.changeBackground(); // Back to 1st
    });
    
    expect(result.current.currentBackgroundImage).toBe(firstImage);
  });

  it('should maintain stable function reference', () => {
    const { result, rerender } = renderHook(() => useBackgroundRotation());
    
    const changeBackground1 = result.current.changeBackground;
    
    rerender();
    
    expect(result.current.changeBackground).toBe(changeBackground1);
  });
});