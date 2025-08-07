import { useState, useEffect, useCallback } from 'react';

export const useFullScreen = (elementRef: React.RefObject<HTMLElement>) => {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const handleFullScreenChange = useCallback(() => {
    setIsFullScreen(!!document.fullscreenElement);
  }, []);
  
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [handleFullScreenChange]);

  const toggleFullScreen = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [elementRef]);

  return { isFullScreen, toggleFullScreen };
};
