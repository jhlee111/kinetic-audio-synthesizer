import { useState, useCallback } from 'react';

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
  const [bgIndex, setBgIndex] = useState(0);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [isUsingCustomBackground, setIsUsingCustomBackground] = useState(false);

  const changeBackground = useCallback(() => {
    if (isUsingCustomBackground) {
      // Switch back to default backgrounds
      setIsUsingCustomBackground(false);
      setCustomBackground(null);
    } else {
      setBgIndex((prevIndex) => (prevIndex + 1) % defaultBackgroundImages.length);
    }
  }, [isUsingCustomBackground]);

  const setCustomBackgroundImage = useCallback((imageUrl: string) => {
    setCustomBackground(imageUrl);
    setIsUsingCustomBackground(true);
  }, []);

  const currentImage = isUsingCustomBackground && customBackground 
    ? customBackground 
    : defaultBackgroundImages[bgIndex];

  return {
    currentBackgroundImage: currentImage,
    changeBackground,
    setCustomBackground: setCustomBackgroundImage,
    isUsingCustomBackground,
    defaultBackgrounds: defaultBackgroundImages
  };
};