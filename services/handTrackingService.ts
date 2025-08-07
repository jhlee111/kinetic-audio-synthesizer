import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

class HandTrackingService {
  private handLandmarker: HandLandmarker | null = null;

  async initialize() {
    if (this.handLandmarker) return;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
    } catch (error) {
      console.error("Error creating HandLandmarker:", error);
      throw new Error("Failed to initialize hand tracking service.");
    }
  }

  detect(video: HTMLVideoElement, timestamp: number) {
    if (!this.handLandmarker) {
      // It's better to return empty results than to throw in a loop
      return { landmarks: [], worldLandmarks: [], handednesses: [] };
    }
    return this.handLandmarker.detectForVideo(video, timestamp);
  }
  
  get isInitialized(): boolean {
    return !!this.handLandmarker;
  }
}

export const handTrackingService = new HandTrackingService();
