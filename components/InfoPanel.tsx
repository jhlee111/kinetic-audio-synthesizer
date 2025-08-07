
import React from 'react';
import { MusicNoteIcon, VolumeUpIcon } from './Icons';

interface InfoPanelProps {
  currentNote: string;
  currentVolume: number;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ currentNote, currentVolume }) => (
  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs p-3 bg-black/40 backdrop-blur-sm rounded-lg flex justify-around items-center text-center border border-gray-700/50 z-20">
    <div className="flex items-center gap-3">
      <MusicNoteIcon className="w-7 h-7 text-cyan-400"/>
      <div>
        <span className="text-xs text-gray-400">NOTE</span>
        <p className="text-xl font-bold text-cyan-300 w-16">{currentNote}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <VolumeUpIcon className="w-7 h-7 text-fuchsia-400"/>
      <div>
        <span className="text-xs text-gray-400">VOLUME</span>
        <p className="text-xl font-bold text-fuchsia-300 w-20">{currentVolume}%</p>
      </div>
    </div>
  </div>
);