
import React from 'react';
import { InstrumentName } from '../services/audioService';
import { Dropdown } from './Dropdown';
import type { DropdownOption } from './Dropdown';
import { SynthIcon, HarpIcon, SparklesIcon, LeadIcon } from './Icons';

const instruments: DropdownOption<InstrumentName>[] = [
    { value: 'oasis', label: 'Oasis', icon: SynthIcon },
    { value: 'celeste', label: 'Celeste', icon: HarpIcon },
    { value: 'starlight', label: 'Starlight', icon: SparklesIcon },
    { value: 'warmlead', label: 'Warm Lead', icon: LeadIcon },
];

interface InstrumentPanelProps {
    currentInstrument: InstrumentName;
    onInstrumentChange: (instrument: InstrumentName) => void;
}

export const InstrumentPanel: React.FC<InstrumentPanelProps> = ({ currentInstrument, onInstrumentChange }) => (
    <Dropdown<InstrumentName>
        ariaLabel="Select Instrument"
        options={instruments}
        value={currentInstrument}
        onChange={onInstrumentChange}
    />
);