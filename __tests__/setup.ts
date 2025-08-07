import '@testing-library/jest-dom';

// Mock MediaDevices API
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }]
    })
  }
});

// Mock MediaPipe
jest.mock('@mediapipe/tasks-vision', () => ({
  HandLandmarker: {
    createFromOptions: jest.fn().mockResolvedValue({
      detectForVideo: jest.fn().mockReturnValue({
        landmarks: [],
        worldLandmarks: [],
        handednesses: []
      })
    })
  },
  FilesetResolver: {
    forVisionTasks: jest.fn().mockResolvedValue({})
  }
}));

// Mock Tone.js
jest.mock('tone', () => ({
  start: jest.fn().mockResolvedValue(undefined),
  getDestination: jest.fn().mockReturnValue({
    volume: { value: -9 }
  }),
  now: jest.fn().mockReturnValue(0),
  Synth: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockReturnThis(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
    frequency: { rampTo: jest.fn() }
  })),
  FMSynth: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockReturnThis(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
    setNote: jest.fn(),
    detune: { connect: jest.fn() }
  })),
  MonoSynth: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockReturnThis(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
    setNote: jest.fn()
  })),
  Chorus: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockReturnThis()
  })),
  PingPongDelay: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockReturnThis()
  })),
  Reverb: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis()
  })),
  LFO: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockReturnThis(),
    connect: jest.fn()
  }))
}));

// Mock Canvas
const mockCanvas = {
  getContext: jest.fn(() => ({
    fillStyle: '',
    strokeStyle: '',
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    rect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    setTransform: jest.fn(),
    resetTransform: jest.fn(),
    clearRect: jest.fn(),
    globalAlpha: 1,
    font: '10px Arial',
    textAlign: 'center',
    fillText: jest.fn()
  })),
  width: 800,
  height: 600
};

HTMLCanvasElement.prototype.getContext = mockCanvas.getContext as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => {
  setTimeout(cb, 16);
  return 1;
};

global.cancelAnimationFrame = jest.fn();