import { useState, useCallback, useEffect, useRef } from 'react';
import { handTrackingService } from '../services/handTrackingService';
import { Status } from '../types';
import { Position } from '../scales/types';

interface UseHandTrackingReturn {
  status: Status;
  webcamRunning: boolean;
  currentPosition: Position | undefined;
  landmarks: any;
  videoRef: React.RefObject<HTMLVideoElement>;
  enableCamera: () => Promise<void>;
  handleVideoLoaded: () => Promise<void>;
  detect: (video: HTMLVideoElement) => any;
}

export const useHandTracking = (): UseHandTrackingReturn => {
  const [status, setStatus] = useState<Status>(Status.LOADING);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<Position | undefined>();
  const [landmarks, setLandmarks] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const enableCamera = useCallback(async () => {
    if (!handTrackingService.isInitialized || webcamRunning) return;
    setStatus(Status.AWAITING_CAMERA);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("getUserMedia error:", err);
      setStatus(Status.ERROR);
    }
  }, [webcamRunning]);

  const handleVideoLoaded = useCallback(async () => {
    if (webcamRunning) return;
    setWebcamRunning(true);
    setStatus(Status.READY);
  }, [webcamRunning]);

  const detect = useCallback((video: HTMLVideoElement) => {
    if (!video || !handTrackingService.isInitialized || video.readyState < 2) {
      return null;
    }

    const results = handTrackingService.detect(video, Date.now());
    
    if (results.landmarks && results.landmarks.length > 0) {
      const handLandmarks = results.landmarks[0];
      const indexTip = handLandmarks[8];
      // Flip the x-coordinate to match the mirrored video feed
      const position = { x: 1 - indexTip.x, y: indexTip.y };
      
      setCurrentPosition(position);
      setLandmarks(handLandmarks);
      
      if (status !== Status.PLAYING) setStatus(Status.PLAYING);
      
      return { landmarks: handLandmarks, position };
    } else {
      setCurrentPosition(undefined);
      setLandmarks(null);
      if (status === Status.PLAYING) setStatus(Status.READY);
      return null;
    }
  }, [status]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach(track => track.stop());
      }
    };
  }, []);

  return {
    status,
    webcamRunning,
    currentPosition,
    landmarks,
    videoRef,
    enableCamera,
    handleVideoLoaded,
    detect
  };
};