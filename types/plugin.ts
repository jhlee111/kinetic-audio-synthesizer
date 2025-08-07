import * as Tone from 'tone';
import React from 'react';

export interface PluginMetadata {
  author: string;
  version: string;
  description: string;
  tags: string[];
  dependencies?: string[];
}

export interface PluginParameter {
  id: string;
  name: string;
  type: 'number' | 'boolean' | 'enum';
  range?: [number, number];
  defaultValue: any;
  units?: string;
  enumOptions?: { value: any; label: string }[];
}

export interface PluginPreset {
  name: string;
  parameters: Record<string, any>;
  metadata?: {
    author?: string;
    tags?: string[];
    created?: Date;
  };
}

export type PluginCategory = 'synth' | 'organic' | 'fx' | 'experimental';

export interface InstrumentPlugin {
  readonly id: string;
  readonly name: string;
  readonly category: PluginCategory;
  readonly icon: React.ComponentType;
  readonly metadata: PluginMetadata;

  // Lifecycle methods
  initialize(context: Tone.BaseContext): Promise<void>;
  dispose(): void;

  // Audio processing
  createSynth(): Promise<Tone.ToneAudioNode>;
  createEffectChain(): Promise<Tone.ToneAudioNode[]>;
  
  // Hand tracking integration
  processHandData(frequency: number, amplitude: number): void;
  
  // Configuration
  getParameters(): PluginParameter[];
  setParameter(id: string, value: number): void;
  getParameter(id: string): number;
  
  // Presets
  savePreset(): PluginPreset;
  loadPreset(preset: PluginPreset): void;

  // Status
  isPlaying(): boolean;
  stop(): void;
}

export interface PluginRegistryEntry {
  plugin: InstrumentPlugin;
  instance?: InstrumentPlugin;
  loadTime?: Date;
}