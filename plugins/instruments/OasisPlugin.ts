import * as Tone from 'tone';
import { BaseInstrumentPlugin } from '../base/BaseInstrumentPlugin';
import { PluginParameter } from '../../types/plugin';
import { SynthIcon } from '../../components/Icons';

export class OasisPlugin extends BaseInstrumentPlugin {
  private oasisSynth: Tone.Synth | null = null;
  private chorus: Tone.Chorus | null = null;
  private delay: Tone.PingPongDelay | null = null;
  private reverb: Tone.Reverb | null = null;

  constructor() {
    super(
      'oasis',
      'Oasis',
      'synth',
      SynthIcon,
      {
        author: 'Built-in',
        version: '1.0.0',
        description: 'Warm, wide synth with fat oscillators and rich spatial effects',
        tags: ['pad', 'warm', 'wide', 'atmospheric']
      }
    );
  }

  async createSynth(): Promise<Tone.Synth> {
    this.oasisSynth = new Tone.Synth({
      oscillator: { 
        type: 'fatsine', 
        spread: this.getParameter('spread'), 
        count: 3 
      },
      envelope: { 
        attack: this.getParameter('attack'), 
        decay: this.getParameter('decay'), 
        sustain: this.getParameter('sustain'), 
        release: this.getParameter('release') 
      }
    });
    
    return this.oasisSynth;
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
      { id: 'attack', name: 'Attack', type: 'number', range: [0, 2], defaultValue: 0.2, units: 's' },
      { id: 'decay', name: 'Decay', type: 'number', range: [0, 2], defaultValue: 0.3, units: 's' },
      { id: 'sustain', name: 'Sustain', type: 'number', range: [0, 1], defaultValue: 0.7 },
      { id: 'release', name: 'Release', type: 'number', range: [0, 5], defaultValue: 2, units: 's' },
      { id: 'spread', name: 'Spread', type: 'number', range: [0, 100], defaultValue: 40, units: 'cents' },
      { id: 'chorus_wet', name: 'Chorus', type: 'number', range: [0, 1], defaultValue: 0.4 },
      { id: 'delay_feedback', name: 'Delay Feedback', type: 'number', range: [0, 0.8], defaultValue: 0.4 },
      { id: 'delay_wet', name: 'Delay Mix', type: 'number', range: [0, 1], defaultValue: 0.3 },
      { id: 'reverb_decay', name: 'Reverb Decay', type: 'number', range: [1, 8], defaultValue: 4, units: 's' },
      { id: 'reverb_wet', name: 'Reverb Mix', type: 'number', range: [0, 1], defaultValue: 0.5 }
    ];
  }

  protected triggerAttack(frequency: number, velocity: number): void {
    if (this.oasisSynth) {
      this.oasisSynth.triggerAttack(frequency, Tone.now(), velocity);
      this.isPlayingState = true;
    }
  }

  protected triggerRelease(): void {
    if (this.oasisSynth) {
      this.oasisSynth.triggerRelease(Tone.now());
      this.isPlayingState = false;
    }
  }

  protected updateNote(frequency: number, velocity: number): void {
    if (this.oasisSynth) {
      this.oasisSynth.frequency.rampTo(frequency, 0.05);
    }
  }

  protected onParameterChanged(id: string, value: any): void {
    if (!this.oasisSynth) return;

    switch (id) {
      case 'attack':
        this.oasisSynth.envelope.attack = value;
        break;
      case 'decay':
        this.oasisSynth.envelope.decay = value;
        break;
      case 'sustain':
        this.oasisSynth.envelope.sustain = value;
        break;
      case 'release':
        this.oasisSynth.envelope.release = value;
        break;
      case 'spread':
        this.oasisSynth.oscillator.spread = value;
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