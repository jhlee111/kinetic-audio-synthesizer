import React from 'react';
import { StartupOverlay } from './StartupOverlay';
import { Status } from '../types';

interface VisualizerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  status: Status;
  webcamRunning: boolean;
  onStartCamera: () => void;
  onVideoLoaded: () => void;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  canvasRef,
  videoRef,
  status,
  webcamRunning,
  onStartCamera,
  onVideoLoaded,
}) => {
  return (
    <div 
      className="relative w-full h-full"
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
      
      {/* 
        The video element is now always rendered to ensure the ref is attached
        and it's available to receive the stream from `enableCam`.
        Visibility is controlled via CSS classes based on the `webcamRunning` state.
      */}
      <video 
        ref={videoRef} 
        className={`absolute bottom-4 right-4 w-40 h-32 md:w-48 md:h-36 object-cover transform scaleX(-1) rounded-lg border-2 border-gray-600/50 shadow-2xl transition-opacity z-20 ${webcamRunning ? 'opacity-50 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
        autoPlay 
        playsInline 
        muted
        onLoadedData={onVideoLoaded}
      ></video>

      {!webcamRunning && <StartupOverlay status={status} onStartCamera={onStartCamera} />}
    </div>
  );
};