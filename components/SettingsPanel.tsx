
import React from 'react';
import { MASTER_PENTATONIC_SCALE, NOTE_NAMES } from '../constants';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  minNote: number;
  maxNote: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  minNote,
  maxNote,
  onMinChange,
  onMaxChange,
}) => {
  if (!isOpen) return null;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value, 10);
    // Ensure min is always less than max
    if (newMin < maxNote) {
      onMinChange(newMin);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value, 10);
    // Ensure max is always greater than min
    if (newMax > minNote) {
      onMaxChange(newMax);
    }
  };
  
  const getNoteNameWithOctave = (index: number) => {
    const note = NOTE_NAMES[index % NOTE_NAMES.length];
    const octave = Math.floor(index / NOTE_NAMES.length) + 2; // "+ 2" because our scale starts at C2
    return `${note}${octave}`;
  }

  return (
    <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40"
        onClick={onClose}
    >
      <div 
        className="relative bg-gray-900/80 border border-gray-700 rounded-xl shadow-2xl p-8 w-full max-w-md animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
      >
        <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Close Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">Note Range</h2>

        <div className="space-y-6">
          {/* Lowest Note Slider */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="min-note" className="font-semibold text-gray-300">Lowest Note</label>
                <span className="text-lg font-mono bg-cyan-400/10 text-cyan-300 px-2 py-0.5 rounded">{getNoteNameWithOctave(minNote)}</span>
            </div>
            <input
              id="min-note"
              type="range"
              min="0"
              max={MASTER_PENTATONIC_SCALE.length - 2}
              value={minNote}
              onChange={handleMinChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb-cyan"
            />
          </div>
          
          {/* Highest Note Slider */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="max-note" className="font-semibold text-gray-300">Highest Note</label>
                <span className="text-lg font-mono bg-fuchsia-400/10 text-fuchsia-300 px-2 py-0.5 rounded">{getNoteNameWithOctave(maxNote)}</span>
            </div>
            <input
              id="max-note"
              type="range"
              min="1"
              max={MASTER_PENTATONIC_SCALE.length - 1}
              value={maxNote}
              onChange={handleMaxChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb-fuchsia"
            />
          </div>
        </div>
      </div>
      <style>{`
          @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
          
          .range-thumb-cyan::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #22d3ee;
            border-radius: 50%;
            border: 2px solid #fff;
            cursor: pointer;
            margin-top: -7px;
          }
           .range-thumb-fuchsia::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #d946ef;
            border-radius: 50%;
            border: 2px solid #fff;
            cursor: pointer;
            margin-top: -7px;
          }
      `}</style>
    </div>
  );
};
