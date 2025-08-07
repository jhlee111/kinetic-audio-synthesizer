import React from 'react';
import { Status } from '../types';

interface StartupOverlayProps {
  status: Status;
  onStartCamera: () => void;
}

export const StartupOverlay: React.FC<StartupOverlayProps> = ({ status, onStartCamera }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
    <p className="text-xl font-semibold mb-4 animate-pulse">{status}</p>
    {status !== Status.LOADING && (
      <button
        onClick={onStartCamera}
        disabled={status !== Status.AWAITING_CAMERA && status !== Status.READY && status !== Status.ERROR}
        className="px-6 py-2 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        Start Camera
      </button>
    )}
  </div>
);
