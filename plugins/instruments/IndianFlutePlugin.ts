import * as Tone from 'tone';
import { BaseInstrumentPlugin } from '../base/BaseInstrumentPlugin';
import { PluginParameter } from '../../types/plugin';
import { FluteIcon } from '../../components/Icons';

export class IndianFlutePlugin extends BaseInstrumentPlugin {
  private indianFluteSynth: Tone.Synth | null = null;
  private fluteChorus: Tone.Chorus | null = null;
  private fluteDelay: Tone.FeedbackDelay | null = null;
  private fluteReverb: Tone.Reverb | null = null;

  constructor() {
    super(
      'indianflute',
      'Indian Flute',
      'organic',
      FluteIcon,
      {
        author: 'Built-in',
        version: '1.0.0',
        description: 'Breathy, organic flute sound with heavy spatial effects and natural resonance',
        tags: ['organic', 'flute', 'breathy', 'spatial', 'world']
      }
    );
  }

  async createSynth(): Promise<Tone.Synth> {
    this.indianFluteSynth = new Tone.Synth({
      oscillator: { 
        type: 'triangle'
      },
      envelope: { 
        attack: this.getParameter('attack'), 
        decay: this.getParameter('decay'), 
        sustain: this.getParameter('sustain'), 
        release: this.getParameter('release') 
      },
      filter: {
        type: 'lowpass',
        frequency: this.getParameter('filter_freq'),
        Q: this.getParameter('filter_q')
      },
      filterEnvelope: {
        attack: this.getParameter('filter_attack'),
        decay: this.getParameter('filter_decay'),
        sustain: this.getParameter('filter_sustain'),
        release: this.getParameter('filter_release'),
        baseFrequency: this.getParameter('filter_base'),
        octaves: this.getParameter('filter_octaves')
      }
    });
    
    return this.indianFluteSynth;
  }

  async createEffectChain(): Promise<Tone.ToneAudioNode[]> {
    // Special effects chain for Indian flute - more atmospheric
    this.fluteChorus = new Tone.Chorus({
      frequency: this.getParameter('chorus_rate'),
      delayTime: 4,
      depth: this.getParameter('chorus_depth'),
      wet: this.getParameter('chorus_wet')
    });

    this.fluteDelay = new Tone.FeedbackDelay({
      delayTime: "8n.",
      feedback: this.getParameter('delay_feedback'),
      wet: this.getParameter('delay_wet')
    });

    this.fluteReverb = new Tone.Reverb({
      decay: this.getParameter('reverb_decay'),
      preDelay: this.getParameter('reverb_predelay'),
      wet: this.getParameter('reverb_wet')
    });
    
    // Wait for reverb to be ready
    await this.fluteReverb.ready;

    return [this.fluteChorus, this.fluteDelay, this.fluteReverb];
  }

  getParameters(): PluginParameter[] {
    return [
      { id: 'attack', name: 'Attack', type: 'number', range: [0, 1], defaultValue: 0.3, units: 's' },
      { id: 'decay', name: 'Decay', type: 'number', range: [0, 1], defaultValue: 0.1, units: 's' },
      { id: 'sustain', name: 'Sustain', type: 'number', range: [0, 1], defaultValue: 0.8 },
      { id: 'release', name: 'Release', type: 'number', range: [0, 8], defaultValue: 2.5, units: 's' },
      { id: 'filter_freq', name: 'Filter Cutoff', type: 'number', range: [200, 8000], defaultValue: 2000, units: 'Hz' },
      { id: 'filter_q', name: 'Filter Q', type: 'number', range: [0.1, 5], defaultValue: 1 },
      { id: 'filter_attack', name: 'Filter Attack', type: 'number', range: [0, 1], defaultValue: 0.2, units: 's' },
      { id: 'filter_decay', name: 'Filter Decay', type: 'number', range: [0, 2], defaultValue: 0.3, units: 's' },
      { id: 'filter_sustain', name: 'Filter Sustain', type: 'number', range: [0, 1], defaultValue: 0.7 },
      { id: 'filter_release', name: 'Filter Release', type: 'number', range: [0, 3], defaultValue: 1.5, units: 's' },
      { id: 'filter_base', name: 'Filter Base', type: 'number', range: [200, 2000], defaultValue: 800, units: 'Hz' },
      { id: 'filter_octaves', name: 'Filter Range', type: 'number', range: [0.5, 3], defaultValue: 1.5, units: 'oct' },
      { id: 'chorus_rate', name: 'Chorus Rate', type: 'number', range: [0.1, 4], defaultValue: 0.8, units: 'Hz' },
      { id: 'chorus_depth', name: 'Chorus Depth', type: 'number', range: [0, 1], defaultValue: 0.8 },
      { id: 'chorus_wet', name: 'Chorus Mix', type: 'number', range: [0, 1], defaultValue: 0.6 },
      { id: 'delay_feedback', name: 'Delay Feedback', type: 'number', range: [0, 0.9], defaultValue: 0.6 },
      { id: 'delay_wet', name: 'Delay Mix', type: 'number', range: [0, 1], defaultValue: 0.5 },
      { id: 'reverb_decay', name: 'Reverb Decay', type: 'number', range: [2, 15], defaultValue: 8, units: 's' },
      { id: 'reverb_predelay', name: 'Reverb PreDelay', type: 'number', range: [0, 0.1], defaultValue: 0.02, units: 's' },
      { id: 'reverb_wet', name: 'Reverb Mix', type: 'number', range: [0, 1], defaultValue: 0.7 }
    ];
  }

  protected triggerAttack(frequency: number, velocity: number): void {
    if (this.indianFluteSynth) {
      this.indianFluteSynth.triggerAttack(frequency, Tone.now(), velocity);
      this.isPlayingState = true;
    }
  }

  protected triggerRelease(): void {
    if (this.indianFluteSynth) {
      this.indianFluteSynth.triggerRelease(Tone.now());
      this.isPlayingState = false;
    }
  }

  protected updateNote(frequency: number, velocity: number): void {
    if (this.indianFluteSynth) {
      this.indianFluteSynth.frequency.rampTo(frequency, 0.05);
    }
  }

  protected onParameterChanged(id: string, value: any): void {
    if (!this.indianFluteSynth) return;

    switch (id) {
      case 'attack':
        this.indianFluteSynth.envelope.attack = value;
        break;
      case 'decay':
        this.indianFluteSynth.envelope.decay = value;
        break;
      case 'sustain':
        this.indianFluteSynth.envelope.sustain = value;
        break;
      case 'release':
        this.indianFluteSynth.envelope.release = value;
        break;
      case 'filter_freq':
        this.indianFluteSynth.filter.frequency.value = value;
        break;
      case 'filter_q':
        this.indianFluteSynth.filter.Q.value = value;
        break;
      case 'filter_attack':
        this.indianFluteSynth.filterEnvelope.attack = value;
        break;
      case 'filter_decay':
        this.indianFluteSynth.filterEnvelope.decay = value;
        break;
      case 'filter_sustain':
        this.indianFluteSynth.filterEnvelope.sustain = value;
        break;
      case 'filter_release':
        this.indianFluteSynth.filterEnvelope.release = value;
        break;
      case 'filter_base':
        this.indianFluteSynth.filterEnvelope.baseFrequency = value;
        break;
      case 'filter_octaves':
        this.indianFluteSynth.filterEnvelope.octaves = value;
        break;
      case 'chorus_rate':
        if (this.fluteChorus) this.fluteChorus.frequency.value = value;
        break;
      case 'chorus_depth':
        if (this.fluteChorus) this.fluteChorus.depth = value;
        break;
      case 'chorus_wet':
        if (this.fluteChorus) this.fluteChorus.wet.value = value;
        break;
      case 'delay_feedback':
        if (this.fluteDelay) this.fluteDelay.feedback.value = value;
        break;
      case 'delay_wet':
        if (this.fluteDelay) this.fluteDelay.wet.value = value;
        break;
      case 'reverb_decay':
        if (this.fluteReverb) this.fluteReverb.decay = value;
        break;
      case 'reverb_predelay':
        if (this.fluteReverb) this.fluteReverb.preDelay = value;
        break;
      case 'reverb_wet':
        if (this.fluteReverb) this.fluteReverb.wet.value = value;
        break;
    }
  }
}