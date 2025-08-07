
import { verticalPentatonic } from './verticalPentatonic';
import { gridScale } from './gridPentatonic';
import { ScaleMapping } from './types';

export const scaleMappings: Record<string, ScaleMapping> = {
  vertical: verticalPentatonic,
  [gridScale.id]: gridScale,
};

export type ScaleMappingId = keyof typeof scaleMappings;
