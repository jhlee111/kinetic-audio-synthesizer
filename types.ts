
export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface Particle {
  x: number; // Can be 3D x relative to center
  y: number; // Can be 3D y relative to center
  z: number; // 3D z coordinate for perspective depth
  vx: number; // No longer used for direction, maintained for type consistency
  vy: number; // No longer used for direction, maintained for type consistency
  vz: number; // Z-velocity for perspective effect
  size: number;
  color: string;
  life: number;
}

export enum Status {
  LOADING = "Loading Models...",
  AWAITING_CAMERA = "Awaiting Camera...",
  READY = "Ready. Show your right hand.",
  ERROR = "Error. Please grant camera access and refresh.",
  PLAYING = "Playing"
}
