
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { useHandTracking } from '../hooks/useHandTracking';
import { useAudioControl } from '../hooks/useAudioControl';
import { useBackgroundRotation } from '../hooks/useBackgroundRotation';
import { useNoteRange } from '../hooks/useNoteRange';
import { scaleMappings } from '../scales';
import { MASTER_PENTATONIC_SCALE } from '../constants';

import { Visualizer } from './Visualizer';
import { InfoPanel } from './InfoPanel';
import { InstrumentPanel } from './InstrumentPanel';
import { ScalePanel } from './ScalePanel';
import { SettingsPanel } from './SettingsPanel';
import { BackgroundSelector } from './BackgroundSelector';
import { CogIcon, RefreshIcon, ViewGridIcon, ViewGridOffIcon, PhotoIcon } from './Icons';
import { Status } from '../types';

const HandSynthesizer: React.FC = () => {
  // State
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackgroundSelectorOpen, setIsBackgroundSelectorOpen] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  
  // Custom Hooks
  const { emitParticles, drawVisuals, resizeCanvas } = useVisualEffects(canvasRef);
  const { status, webcamRunning, currentPosition, landmarks, videoRef, enableCamera, handleVideoLoaded, detect } = useHandTracking();
  const { currentNote, currentVolume, instrument, scaleId, handleInstrumentChange, handleScaleChange, processAudio, initializeAudio } = useAudioControl();
  const { currentBackgroundImage, changeBackground, setCustomBackground, defaultBackgrounds } = useBackgroundRotation();
  const { minNoteIndex, maxNoteIndex, setMinNoteIndex, setMaxNoteIndex } = useNoteRange();
  
  // Initialize audio service when video is loaded
  const handleVideoLoadedWithAudio = useCallback(async () => {
    await handleVideoLoaded();
    await initializeAudio();
    resizeCanvas();
  }, [handleVideoLoaded, initializeAudio, resizeCanvas]);
  
  // Logic for a single animation frame
  const runDetectionFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    
    const detectionResult = detect(video);
    
    // Process audio based on detection results
    processAudio(currentPosition, landmarks, minNoteIndex, maxNoteIndex);
    
    // Emit particles if we have a position and sufficient volume
    if (currentPosition && landmarks && currentVolume > 5) {
      const activeScaleMapping = scaleMappings[scaleId];
      const scaleSlice = MASTER_PENTATONIC_SCALE.slice(minNoteIndex, maxNoteIndex + 1);
      const noteData = activeScaleMapping.getNote(currentPosition, scaleSlice, minNoteIndex);
      
      if (noteData && currentVolume > 5) {
        emitParticles(currentPosition.x, currentPosition.y, currentVolume / 100, noteData.noteIndex);
      }
    }
    
    // Draw visuals
    const activeScaleMapping = scaleMappings[scaleId];
    const scaleSlice = MASTER_PENTATONIC_SCALE.slice(minNoteIndex, maxNoteIndex + 1);
    drawVisuals(activeScaleMapping, scaleSlice, minNoteIndex, currentPosition, showGrid);

  }, [detect, processAudio, currentPosition, landmarks, currentVolume, minNoteIndex, maxNoteIndex, scaleId, emitParticles, drawVisuals, showGrid]);
  
  // Animation loop effect
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      runDetectionFrame();
      frameId = requestAnimationFrame(loop);
    };

    if (webcamRunning) {
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [webcamRunning, runDetectionFrame]);
  

  useEffect(() => {
    const handleOrientationChange = () => {
      // Regenerate grid on orientation change
      const activeScale = scaleMappings[scaleId];
      if (activeScale.regenerate) {
        activeScale.regenerate();
      }
      resizeCanvas();
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    }
  }, [scaleId, resizeCanvas]);

  const activeScale = scaleMappings[scaleId];

  // Render
  return (
    <div 
      ref={appContainerRef} 
      className="relative w-full h-full overflow-hidden bg-black transition-all duration-1000"
      style={{
        backgroundImage: `url(${currentBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <Visualizer 
        canvasRef={canvasRef}
        videoRef={videoRef}
        status={status}
        webcamRunning={webcamRunning}
        onStartCamera={enableCamera}
        onVideoLoaded={handleVideoLoadedWithAudio}
      />
      
      {webcamRunning && (
        <>
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-30">
            <InstrumentPanel currentInstrument={instrument} onInstrumentChange={handleInstrumentChange} />
          </div>

          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-30 flex items-center gap-1 sm:gap-2">
            {activeScale.hasGridVisualization && (
              <button
                onClick={() => setShowGrid(!showGrid)}
                className="p-2 sm:p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/80 backdrop-blur-sm rounded-lg text-white transition-colors"
                aria-label={showGrid ? "Hide Grid" : "Show Grid"}
              >
                {showGrid ? <ViewGridIcon className="w-4 h-4 sm:w-5 sm:h-5"/> : <ViewGridOffIcon className="w-4 h-4 sm:w-5 sm:h-5"/>}
              </button>
            )}
            <ScalePanel currentScale={scaleId} onScaleChange={handleScaleChange} />
            {activeScale.regenerate && (
              <button
                onClick={activeScale.regenerate}
                className="p-2 sm:p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/80 backdrop-blur-sm rounded-lg text-white transition-colors"
                aria-label="Regenerate Grid"
              >
                <RefreshIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
              </button>
            )}
            <button
              onClick={() => setIsBackgroundSelectorOpen(true)}
              className="p-2 sm:p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/80 backdrop-blur-sm rounded-lg text-white transition-colors"
              aria-label="Select Background"
            >
              <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 sm:p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/80 backdrop-blur-sm rounded-lg text-white transition-colors"
              aria-label="Open Settings"
            >
              <CogIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
            </button>
          </div>
          
          <SettingsPanel 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            minNote={minNoteIndex}
            maxNote={maxNoteIndex}
            onMinChange={setMinNoteIndex}
            onMaxChange={setMaxNoteIndex}
          />

          <InfoPanel currentNote={currentNote} currentVolume={currentVolume} />
          
          <BackgroundSelector
            isOpen={isBackgroundSelectorOpen}
            onClose={() => setIsBackgroundSelectorOpen(false)}
            currentBackground={currentBackgroundImage}
            onBackgroundSelect={setCustomBackground}
            defaultBackgrounds={defaultBackgrounds}
          />
        </>
      )}
    </div>
  );
};

export default HandSynthesizer;