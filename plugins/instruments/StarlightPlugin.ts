import * as Tone from 'tone';
import { BaseInstrumentPlugin } from '../base/BaseInstrumentPlugin';
import { PluginParameter } from '../../types/plugin';
import { SparklesIcon } from '../../components/Icons';

export class StarlightPlugin extends BaseInstrumentPlugin {
  private starlightSynth: Tone.FMSynth | null = null;
  private chorus: Tone.Chorus | null = null;
  private delay: Tone.PingPongDelay | null = null;
  private reverb: Tone.Reverb | null = null;

  constructor() {
    super(
      'starlight',
      'Starlight',
      'synth',
      SparklesIcon,
      {
        author: 'Built-in',
        version: '1.0.0',
        description: 'Atmospheric FM pad with long, evolving textures perfect for ambient soundscapes',
        tags: ['pad', 'ambient', 'atmospheric', 'evolving']
      }
    );
  }

  async createSynth(): Promise<Tone.FMSynth> {
    this.starlightSynth = new Tone.FMSynth({
      harmonicity: this.getParameter('harmonicity'),
      modulationIndex: this.getParameter('modulation_index'),
      oscillator: { type: "triangle" },
      envelope: { 
        attack: this.getParameter('attack'), 
        decay: this.getParameter('decay'), 
        sustain: this.getParameter('sustain'), 
        release: this.getParameter('release') 
      },
      modulation: { type: "sine" },
      modulationEnvelope: { 
        attack: this.getParameter('mod_attack'), 
        decay: 0, 
        sustain: 1, 
        release: this.getParameter('mod_release') 
      }
    });
    
    return this.starlightSynth;
  }

  async createEffectChain(): Promise<Tone.ToneAudioNode[]> {
    this.chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 3.5,
      depth: 0.7,
      wet: this.getParameter('chorus_wet')
    });

    this.delay = new Tone.PingPongDelay({
      delayTime: "8n.",
      feedback: this.getParameter('delay_feedback'),
      wet: this.getParameter('delay_wet')
    });

    this.reverb = new Tone.Reverb({
      decay: this.getParameter('reverb_decay'),
      preDelay: 0.01,
      wet: this.getParameter('reverb_wet')
    });
    
    // Wait for reverb to be ready
    await this.reverb.ready;

    return [this.chorus, this.delay, this.reverb];
  }

  getParameters(): PluginParameter[] {
    return [
      { id: 'attack', name: 'Attack', type: 'number', range: [0, 3], defaultValue: 0.8, units: 's' },
      { id: 'decay', name: 'Decay', type: 'number', range: [0, 1], defaultValue: 0.1, units: 's' },
      { id: 'sustain', name: 'Sustain', type: 'number', range: [0, 1], defaultValue: 0.7 },
      { id: 'release', name: 'Release', type: 'number', range: [0, 8], defaultValue: 2.5, units: 's' },
      { id: 'harmonicity', name: 'Harmonicity', type: 'number', range: [0.5, 4], defaultValue: 1.5 },
      { id: 'modulation_index', name: 'FM Amount', type: 'number', range: [0, 40], defaultValue: 20 },
      { id: 'mod_attack', name: 'Mod Attack', type: 'number', range: [0, 3], defaultValue: 1.2, units: 's' },
      { id: 'mod_release', name: 'Mod Release', type: 'number', range: [0, 5], defaultValue: 2.5, units: 's' },
      { id: 'chorus_wet', name: 'Chorus', type: 'number', range: [0, 1], defaultValue: 0.4 },
      { id: 'delay_feedback', name: 'Delay Feedback', type: 'number', range: [0, 0.8], defaultValue: 0.4 },
      { id: 'delay_wet', name: 'Delay Mix', type: 'number', range: [0, 1], defaultValue: 0.3 },
      { id: 'reverb_decay', name: 'Reverb Decay', type: 'number', range: [1, 8], defaultValue: 4, units: 's' },
      { id: 'reverb_wet', name: 'Reverb Mix', type: 'number', range: [0, 1], defaultValue: 0.5 }
    ];
  }

  protected triggerAttack(frequency: number, velocity: number): void {
    if (this.starlightSynth) {
      this.starlightSynth.triggerAttack(frequency, Tone.now(), velocity);
      this.isPlayingState = true;
    }
  }

  protected triggerRelease(): void {
    if (this.starlightSynth) {
      this.starlightSynth.triggerRelease(Tone.now());
      this.isPlayingState = false;
    }
  }

  protected updateNote(frequency: number, velocity: number): void {
    if (this.starlightSynth) {
      this.starlightSynth.setNote(frequency, Tone.now() + 0.02);
    }
  }

  protected onParameterChanged(id: string, value: any): void {
    if (!this.starlightSynth) return;

    switch (id) {
      case 'attack':
        this.starlightSynth.envelope.attack = value;
        break;
      case 'decay':
        this.starlightSynth.envelope.decay = value;
        break;
      case 'sustain':
        this.starlightSynth.envelope.sustain = value;
        break;
      case 'release':
        this.starlightSynth.envelope.release = value;
        break;
      case 'harmonicity':
        this.starlightSynth.harmonicity.value = value;
        break;
      case 'modulation_index':
        this.starlightSynth.modulationIndex.value = value;
        break;
      case 'mod_attack':
        this.starlightSynth.modulationEnvelope.attack = value;
        break;
      case 'mod_release':
        this.starlightSynth.modulationEnvelope.release = value;
        break;
      case 'chorus_wet':
        if (this.chorus) this.chorus.wet.value = value;
        break;
      case 'delay_feedback':
        if (this.delay) this.delay.feedback.value = value;
        break;
      case 'delay_wet':
        if (this.delay) this.delay.wet.value = value;
        break;
      case 'reverb_decay':
        if (this.reverb) this.reverb.decay = value;
        break;
      case 'reverb_wet':
        if (this.reverb) this.reverb.wet.value = value;
        break;
    }
  }
}