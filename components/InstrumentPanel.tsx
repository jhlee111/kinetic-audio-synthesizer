
import React from 'react';
import { InstrumentName } from '../services/audioService';
import { Dropdown } from './Dropdown';
import type { DropdownOption } from './Dropdown';
import { PluginRegistry } from '../services/PluginRegistry';

interface InstrumentPanelProps {
    currentInstrument: InstrumentName;
    onInstrumentChange: (instrument: InstrumentName) => void;
}

export const InstrumentPanel: React.FC<InstrumentPanelProps> = ({ currentInstrument, onInstrumentChange }) => {
    const pluginRegistry = PluginRegistry.getInstance();
    
    // Get instruments directly from plugin registry (synchronous)
    const availablePlugins = pluginRegistry.getAvailablePlugins();
    const instruments: DropdownOption<InstrumentName>[] = availablePlugins.map(plugin => ({
        value: plugin.id as InstrumentName,
        label: plugin.name,
        icon: plugin.icon
    }));
    
    return (
        <Dropdown<InstrumentName>
            ariaLabel="Select Instrument"
            options={instruments}
            value={currentInstrument}
            onChange={onInstrumentChange}
        />
    );
};