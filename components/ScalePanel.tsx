
import React from 'react';
import { scaleMappings, ScaleMappingId } from '../scales';
import { VerticalBarsIcon, GridIcon } from './Icons';
import { Dropdown } from './Dropdown';
import type { DropdownOption } from './Dropdown';

const scaleOptions: DropdownOption<ScaleMappingId>[] = Object.values(scaleMappings).map(scale => ({
    value: scale.id as ScaleMappingId,
    label: scale.name,
    // Use includes to correctly assign the icon to any grid-based scale
    icon: scale.id.includes('grid') ? GridIcon : VerticalBarsIcon,
}));

interface ScalePanelProps {
  currentScale: ScaleMappingId;
  onScaleChange: (scaleId: ScaleMappingId) => void;
}

export const ScalePanel: React.FC<ScalePanelProps> = ({ currentScale, onScaleChange }) => (
    <Dropdown<ScaleMappingId>
        ariaLabel="Select Scale Mode"
        options={scaleOptions}
        value={currentScale}
        onChange={onScaleChange}
    />
);
