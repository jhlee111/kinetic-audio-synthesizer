import { useCallback } from 'react';
import { useUserConfig } from './useUserConfig';

export const defaultBackgroundImages = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1848&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2070&auto=format&fit=crop'
];

interface UseBackgroundRotationReturn {
  currentBackgroundImage: string;
  changeBackground: () => void;
  setCustomBackground: (imageUrl: string) => void;
  isUsingCustomBackground: boolean;
  defaultBackgrounds: string[];
}

export const useBackgroundRotation = (): UseBackgroundRotationReturn => {
  const { config, setBackground } = useUserConfig();
  
  // Get current background info from config
  const isUsingCustomBackground = config.isUsingCustomBackground;
  const currentBackgroundImage = config.currentBackgroundImage;

  const changeBackground = useCallback(() => {
    if (isUsingCustomBackground) {
      // Switch back to first default background
      setBackground(defaultBackgroundImages[0], false);
    } else {
      // Find current index and move to next
      const currentIndex = defaultBackgroundImages.indexOf(currentBackgroundImage);
      const nextIndex = (currentIndex + 1) % defaultBackgroundImages.length;
      setBackground(defaultBackgroundImages[nextIndex], false);
    }
  }, [isUsingCustomBackground, currentBackgroundImage, setBackground]);

  const setCustomBackgroundImage = useCallback((imageUrl: string) => {
    setBackground(imageUrl, true);
  }, [setBackground]);

  return {
    currentBackgroundImage,
    changeBackground,
    setCustomBackground: setCustomBackgroundImage,
    isUsingCustomBackground,
    defaultBackgrounds: defaultBackgroundImages
  };
};