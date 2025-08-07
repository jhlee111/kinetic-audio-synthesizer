import * as Tone from 'tone';
import React from 'react';
import { InstrumentPlugin, PluginMetadata, PluginParameter, PluginPreset, PluginCategory } from '../../types/plugin';

export abstract class BaseInstrumentPlugin implements InstrumentPlugin {
  protected synth: Tone.ToneAudioNode | null = null;
  protected effectChain: Tone.ToneAudioNode[] = [];
  protected isPlayingState = false;
  protected parameters: Map<string, any> = new Map();
  protected outputNode: Tone.ToneAudioNode | null = null;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly category: PluginCategory,
    public readonly icon: React.ComponentType,
    public readonly metadata: PluginMetadata
  ) {
    // Initialize default parameters
    this.getParameters().forEach(param => {
      this.parameters.set(param.id, param.defaultValue);
    });
  }

  async initialize(context: Tone.BaseContext): Promise<void> {
    try {
      console.log(`Initializing plugin: ${this.id}`);
      this.synth = await this.createSynth();
      
      if (!this.synth) {
        throw new Error(`Failed to create synth for plugin: ${this.id}`);
      }
      
      this.effectChain = await this.createEffectChain();
      this.outputNode = this.connectEffectChain();
      console.log(`Plugin ${this.id} initialized successfully`);
    } catch (error) {
      console.error(`Failed to initialize plugin ${this.id}:`, error);
      throw error;
    }
  }

  dispose(): void {
    this.stop();
    this.synth?.dispose();
    this.effectChain.forEach(effect => effect.dispose());
    this.outputNode?.dispose();
    this.synth = null;
    this.effectChain = [];
    this.outputNode = null;
  }

  processHandData(frequency: number, amplitude: number): void {
    if (!this.synth) {
      // console.log(`Plugin ${this.id}: No synth available`);
      return;
    }
    
    const velocity = Math.max(0, Math.min(1, amplitude));
    
    if (velocity > 0.05 && !this.isPlayingState) {
      // console.log(`Plugin ${this.id}: Triggering attack - freq: ${frequency}, vel: ${velocity}`);
      this.triggerAttack(frequency, velocity);
    } else if (velocity <= 0.05 && this.isPlayingState) {
      // console.log(`Plugin ${this.id}: Triggering release`);
      this.triggerRelease();
    } else if (this.isPlayingState) {
      this.updateNote(frequency, velocity);
    }
  }

  setParameter(id: string, value: number): void {
    const param = this.getParameters().find(p => p.id === id);
    if (!param) return;

    // Validate range
    if (param.range && param.type === 'number') {
      value = Math.max(param.range[0], Math.min(param.range[1], value));
    }

    this.parameters.set(id, value);
    this.onParameterChanged(id, value);
  }

  getParameter(id: string): number {
    return this.parameters.get(id) ?? 0;
  }

  savePreset(): PluginPreset {
    const parameters: Record<string, any> = {};
    this.parameters.forEach((value, key) => {
      parameters[key] = value;
    });

    return {
      name: `${this.name} Preset`,
      parameters,
      metadata: {
        created: new Date()
      }
    };
  }

  loadPreset(preset: PluginPreset): void {
    Object.entries(preset.parameters).forEach(([key, value]) => {
      this.setParameter(key, value);
    });
  }

  isPlaying(): boolean {
    return this.isPlayingState;
  }

  stop(): void {
    if (this.isPlayingState) {
      this.triggerRelease();
    }
  }

  // Abstract methods to be implemented by concrete plugins
  abstract createSynth(): Promise<Tone.ToneAudioNode>;
  abstract createEffectChain(): Promise<Tone.ToneAudioNode[]>;
  abstract getParameters(): PluginParameter[];

  // Protected methods for subclasses
  protected abstract triggerAttack(frequency: number, velocity: number): void;
  protected abstract triggerRelease(): void;
  protected abstract updateNote(frequency: number, velocity: number): void;

  // Hook for parameter changes - override in subclasses if needed
  protected onParameterChanged(id: string, value: any): void {
    // Default implementation - can be overridden
  }

  private connectEffectChain(): Tone.ToneAudioNode {
    if (!this.synth) {
      throw new Error('Synth must be created before connecting effect chain');
    }

    if (this.effectChain.length === 0) {
      this.synth.toDestination();
      return this.synth;
    }

    // Connect synth to first effect
    let previousNode: Tone.ToneAudioNode = this.synth;
    
    for (const effect of this.effectChain) {
      previousNode.connect(effect);
      previousNode = effect;
    }
    
    // Connect last effect to destination
    previousNode.toDestination();
    
    return previousNode;
  }
}