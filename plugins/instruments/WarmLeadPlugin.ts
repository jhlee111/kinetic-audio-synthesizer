import * as Tone from 'tone';
import { BaseInstrumentPlugin } from '../base/BaseInstrumentPlugin';
import { PluginParameter } from '../../types/plugin';
import { LeadIcon } from '../../components/Icons';

export class WarmLeadPlugin extends BaseInstrumentPlugin {
  private warmLeadSynth: Tone.MonoSynth | null = null;
  private chorus: Tone.Chorus | null = null;
  private delay: Tone.PingPongDelay | null = null;
  private reverb: Tone.Reverb | null = null;

  constructor() {
    super(
      'warmlead',
      'Warm Lead',
      'synth',
      LeadIcon,
      {
        author: 'Built-in',
        version: '1.0.0',
        description: 'Expressive monophonic synthesizer with portamento and resonant filter for lead lines',
        tags: ['lead', 'mono', 'filter', 'expressive']
      }
    );
  }

  async createSynth(): Promise<Tone.MonoSynth> {
    this.warmLeadSynth = new Tone.MonoSynth({
      portamento: this.getParameter('portamento'),
      oscillator: { type: "sawtooth" },
      envelope: { 
        attack: this.getParameter('attack'), 
        decay: this.getParameter('decay'), 
        sustain: this.getParameter('sustain'), 
        release: this.getParameter('release') 
      },
      filter: { 
        Q: this.getParameter('filter_q'), 
        type: "lowpass", 
        rolloff: -24 
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
    
    return this.warmLeadSynth;
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
      { id: 'attack', name: 'Attack', type: 'number', range: [0, 1], defaultValue: 0.05, units: 's' },
      { id: 'decay', name: 'Decay', type: 'number', range: [0, 2], defaultValue: 0.3, units: 's' },
      { id: 'sustain', name: 'Sustain', type: 'number', range: [0, 1], defaultValue: 0.4 },
      { id: 'release', name: 'Release', type: 'number', range: [0, 3], defaultValue: 0.8, units: 's' },
      { id: 'portamento', name: 'Portamento', type: 'number', range: [0, 0.5], defaultValue: 0.01, units: 's' },
      { id: 'filter_q', name: 'Filter Q', type: 'number', range: [0.1, 20], defaultValue: 4 },
      { id: 'filter_attack', name: 'Filter Attack', type: 'number', range: [0, 1], defaultValue: 0.01, units: 's' },
      { id: 'filter_decay', name: 'Filter Decay', type: 'number', range: [0, 2], defaultValue: 0.7, units: 's' },
      { id: 'filter_sustain', name: 'Filter Sustain', type: 'number', range: [0, 1], defaultValue: 0.1 },
      { id: 'filter_release', name: 'Filter Release', type: 'number', range: [0, 3], defaultValue: 1, units: 's' },
      { id: 'filter_base', name: 'Filter Base', type: 'number', range: [50, 1000], defaultValue: 300, units: 'Hz' },
      { id: 'filter_octaves', name: 'Filter Range', type: 'number', range: [1, 8], defaultValue: 5, units: 'oct' },
      { id: 'chorus_wet', name: 'Chorus', type: 'number', range: [0, 1], defaultValue: 0.4 },
      { id: 'delay_feedback', name: 'Delay Feedback', type: 'number', range: [0, 0.8], defaultValue: 0.4 },
      { id: 'delay_wet', name: 'Delay Mix', type: 'number', range: [0, 1], defaultValue: 0.3 },
      { id: 'reverb_decay', name: 'Reverb Decay', type: 'number', range: [1, 8], defaultValue: 4, units: 's' },
      { id: 'reverb_wet', name: 'Reverb Mix', type: 'number', range: [0, 1], defaultValue: 0.5 }
    ];
  }

  protected triggerAttack(frequency: number, velocity: number): void {
    if (this.warmLeadSynth) {
      this.warmLeadSynth.triggerAttack(frequency, Tone.now(), velocity);
      this.isPlayingState = true;
    }
  }

  protected triggerRelease(): void {
    if (this.warmLeadSynth) {
      this.warmLeadSynth.triggerRelease(Tone.now());
      this.isPlayingState = false;
    }
  }

  protected updateNote(frequency: number, velocity: number): void {
    if (this.warmLeadSynth) {
      this.warmLeadSynth.setNote(frequency, Tone.now() + 0.02);
    }
  }

  protected onParameterChanged(id: string, value: any): void {
    if (!this.warmLeadSynth) return;

    switch (id) {
      case 'attack':
        this.warmLeadSynth.envelope.attack = value;
        break;
      case 'decay':
        this.warmLeadSynth.envelope.decay = value;
        break;
      case 'sustain':
        this.warmLeadSynth.envelope.sustain = value;
        break;
      case 'release':
        this.warmLeadSynth.envelope.release = value;
        break;
      case 'portamento':
        this.warmLeadSynth.portamento = value;
        break;
      case 'filter_q':
        this.warmLeadSynth.filter.Q.value = value;
        break;
      case 'filter_attack':
        this.warmLeadSynth.filterEnvelope.attack = value;
        break;
      case 'filter_decay':
        this.warmLeadSynth.filterEnvelope.decay = value;
        break;
      case 'filter_sustain':
        this.warmLeadSynth.filterEnvelope.sustain = value;
        break;
      case 'filter_release':
        this.warmLeadSynth.filterEnvelope.release = value;
        break;
      case 'filter_base':
        this.warmLeadSynth.filterEnvelope.baseFrequency = value;
        break;
      case 'filter_octaves':
        this.warmLeadSynth.filterEnvelope.octaves = value;
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