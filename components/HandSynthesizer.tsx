
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { handTrackingService } from '../services/handTrackingService';
import { audioService, InstrumentName } from '../services/audioService';
import { useVisualEffects } from '../hooks/useVisualEffects';
import { processHandDataForGain, resetAudioSmoothening } from '../utils/audioUtils';
import { scaleMappings, ScaleMappingId } from '../scales';
import { Position } from '../scales/types';
import { MASTER_PENTATONIC_SCALE } from '../constants';

import { Visualizer } from './Visualizer';
import { InfoPanel } from './InfoPanel';
import { InstrumentPanel } from './InstrumentPanel';
import { ScalePanel } from './ScalePanel';
import { SettingsPanel } from './SettingsPanel';
import { CogIcon, RefreshIcon, EyeIcon, EyeOffIcon, PhotoIcon } from './Icons';
import { Status } from '../types';

const backgroundImages = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1848&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2070&auto=format&fit=crop'
];

const HandSynthesizer: React.FC = () => {
  // State
  const [status, setStatus] = useState<Status>(Status.LOADING);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const [currentNote, setCurrentNote] = useState<string>('--');
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [instrument, setInstrument] = useState<InstrumentName>('oasis');
  const [scaleId, setScaleId] = useState<ScaleMappingId>('grid_wfc');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [bgIndex, setBgIndex] = useState(0);
  
  // Note Range State
  const [minNoteIndex, setMinNoteIndex] = useState(10); // Start at C4
  const [maxNoteIndex, setMaxNoteIndex] = useState(30); // End at C6
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { emitParticles, drawVisuals, resizeCanvas } = useVisualEffects(canvasRef);
  
  // Handlers
  const handleInstrumentChange = (newInstrument: InstrumentName) => {
    setInstrument(newInstrument);
    audioService.setInstrument(newInstrument);
  };

  const handleScaleChange = (newScaleId: ScaleMappingId) => {
    setScaleId(newScaleId);
  };

  const handleChangeBackground = () => {
    setBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
  };
  
  // Logic for a single animation frame
  const runDetectionFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !handTrackingService.isInitialized || video.readyState < 2) {
      return;
    }
    
    let activePosition: Position | undefined;
    const activeScaleMapping = scaleMappings[scaleId];
    const scaleSlice = MASTER_PENTATONIC_SCALE.slice(minNoteIndex, maxNoteIndex + 1);
    
    const results = handTrackingService.detect(video, Date.now());
    
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      const indexTip = landmarks[8];
      // Flip the x-coordinate to match the mirrored video feed
      activePosition = { x: 1 - indexTip.x, y: indexTip.y };
      
      const noteData = activeScaleMapping.getNote(activePosition, scaleSlice, minNoteIndex);
      const gain = processHandDataForGain(landmarks);

      if (noteData) {
        audioService.update(noteData.frequency, gain);
        setCurrentNote(noteData.noteName);
        setCurrentVolume(Math.round(gain * 100));

        if (gain > 0.05) {
          emitParticles(activePosition.x, activePosition.y, gain, noteData.noteIndex);
        }
      }
      
      if (status !== Status.PLAYING) setStatus(Status.PLAYING);
    } else {
      audioService.rampToGain(0, 0.1);
      resetAudioSmoothening();
      setCurrentNote('--');
      setCurrentVolume(0);
      if (status === Status.PLAYING) setStatus(Status.READY);
    }
    
    drawVisuals(activeScaleMapping, scaleSlice, minNoteIndex, activePosition, showGrid);

  }, [drawVisuals, emitParticles, status, scaleId, minNoteIndex, maxNoteIndex, showGrid]);
  
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

  const handleVideoLoaded = useCallback(async () => {
    // Guard against this being called multiple times
    if (webcamRunning) return;

    await audioService.init();
    resizeCanvas();
    setWebcamRunning(true);
    setStatus(Status.READY);
  }, [webcamRunning, resizeCanvas]);

  const enableCam = useCallback(async () => {
    if (!handTrackingService.isInitialized || webcamRunning) return;
    setStatus(Status.AWAITING_CAMERA);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("getUserMedia error:", err);
      setStatus(Status.ERROR);
    }
  }, [webcamRunning]);
  
  // Lifecycle
  useEffect(() => {
    async function initialize() {
      try {
        await handTrackingService.initialize();
        setStatus(Status.AWAITING_CAMERA);
      } catch (error) {
        console.error(error);
        setStatus(Status.ERROR);
      }
    }
    initialize();
  }, []);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      audioService.stop();
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    }
  }, []);

  const activeScale = scaleMappings[scaleId];

  // Render
  return (
    <div 
      ref={appContainerRef} 
      className="relative w-full h-full overflow-hidden bg-black transition-all duration-1000"
      style={{
        backgroundImage: `url(${backgroundImages[bgIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <Visualizer 
        canvasRef={canvasRef}
        videoRef={videoRef}
        status={status}
        webcamRunning={webcamRunning}
        onStartCamera={enableCam}
        onVideoLoaded={handleVideoLoaded}
      />
      
      {webcamRunning && (
        <>
          <div className="absolute top-4 left-4 z-30">
            <InstrumentPanel currentInstrument={instrument} onInstrumentChange={handleInstrumentChange} />
          </div>

          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            <ScalePanel currentScale={scaleId} onScaleChange={handleScaleChange} />
            {activeScale.regenerate && (
              <button
                onClick={activeScale.regenerate}
                className="p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/80 backdrop-blur-sm rounded-lg text-white transition-colors"
                aria-label="Regenerate Grid"
              >
                <RefreshIcon className="w-5 h-5"/>
              </button>
            )}
            {activeScale.hasGridVisualization && (
              <button
                onClick={() => setShowGrid(!showGrid)}
                className="p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/80 backdrop-blur-sm rounded-lg text-white transition-colors"
                aria-label={showGrid ? "Hide Grid" : "Show Grid"}
              >
                {showGrid ? <EyeIcon className="w-5 h-5"/> : <EyeOffIcon className="w-5 h-5"/>}
              </button>
            )}
            <button
              onClick={handleChangeBackground}
              className="p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/80 backdrop-blur-sm rounded-lg text-white transition-colors"
              aria-label="Change Background"
            >
              <PhotoIcon className="w-5 h-5"/>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/80 backdrop-blur-sm rounded-lg text-white transition-colors"
              aria-label="Open Settings"
            >
              <CogIcon className="w-5 h-5"/>
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
        </>
      )}
    </div>
  );
};

export default HandSynthesizer;