import * as Tone from 'tone';
import { BaseInstrumentPlugin } from '../base/BaseInstrumentPlugin';
import { PluginParameter } from '../../types/plugin';
import { HarpIcon } from '../../components/Icons';

export class CelestePlugin extends BaseInstrumentPlugin {
  private celesteSynth: Tone.FMSynth | null = null;
  private vibrato: Tone.LFO | null = null;
  private chorus: Tone.Chorus | null = null;
  private delay: Tone.PingPongDelay | null = null;
  private reverb: Tone.Reverb | null = null;

  constructor() {
    super(
      'celeste',
      'Celeste',
      'synth',
      HarpIcon,
      {
        author: 'Built-in',
        version: '1.0.0',
        description: 'Crystalline FM synthesis with subtle vibrato and ethereal character',
        tags: ['crystal', 'fm', 'bright', 'bell-like']
      }
    );
  }

  async createSynth(): Promise<Tone.FMSynth> {
    this.celesteSynth = new Tone.FMSynth({
      harmonicity: this.getParameter('harmonicity'),
      modulationIndex: this.getParameter('modulation_index'),
      oscillator: { type: 'sine' },
      envelope: { 
        attack: this.getParameter('attack'), 
        decay: this.getParameter('decay'), 
        sustain: this.getParameter('sustain'), 
        release: this.getParameter('release') 
      },
      modulation: { type: 'square' },
      modulationEnvelope: { 
        attack: 0.02, 
        decay: 0.3, 
        sustain: 0, 
        release: this.getParameter('mod_release') 
      }
    });

    // Create vibrato LFO
    this.vibrato = new Tone.LFO(this.getParameter('vibrato_rate'), -5, 5).start();
    this.vibrato.connect(this.celesteSynth.detune);
    
    return this.celesteSynth;
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
      { id: 'attack', name: 'Attack', type: 'number', range: [0, 0.5], defaultValue: 0.01, units: 's' },
      { id: 'decay', name: 'Decay', type: 'number', range: [0, 2], defaultValue: 0.2, units: 's' },
      { id: 'sustain', name: 'Sustain', type: 'number', range: [0, 1], defaultValue: 0.1 },
      { id: 'release', name: 'Release', type: 'number', range: [0, 5], defaultValue: 1.5, units: 's' },
      { id: 'harmonicity', name: 'Harmonicity', type: 'number', range: [0.5, 8], defaultValue: 3.01 },
      { id: 'modulation_index', name: 'FM Amount', type: 'number', range: [0, 50], defaultValue: 14 },
      { id: 'mod_release', name: 'Mod Release', type: 'number', range: [0, 2], defaultValue: 0.8, units: 's' },
      { id: 'vibrato_rate', name: 'Vibrato Rate', type: 'number', range: [0, 20], defaultValue: 6, units: 'Hz' },
      { id: 'chorus_wet', name: 'Chorus', type: 'number', range: [0, 1], defaultValue: 0.4 },
      { id: 'delay_feedback', name: 'Delay Feedback', type: 'number', range: [0, 0.8], defaultValue: 0.4 },
      { id: 'delay_wet', name: 'Delay Mix', type: 'number', range: [0, 1], defaultValue: 0.3 },
      { id: 'reverb_decay', name: 'Reverb Decay', type: 'number', range: [1, 8], defaultValue: 4, units: 's' },
      { id: 'reverb_wet', name: 'Reverb Mix', type: 'number', range: [0, 1], defaultValue: 0.5 }
    ];
  }

  protected triggerAttack(frequency: number, velocity: number): void {
    if (this.celesteSynth) {
      this.celesteSynth.triggerAttack(frequency, Tone.now(), velocity);
      this.isPlayingState = true;
    }
  }

  protected triggerRelease(): void {
    if (this.celesteSynth) {
      this.celesteSynth.triggerRelease(Tone.now());
      this.isPlayingState = false;
    }
  }

  protected updateNote(frequency: number, velocity: number): void {
    if (this.celesteSynth) {
      this.celesteSynth.setNote(frequency, Tone.now() + 0.02);
    }
  }

  protected onParameterChanged(id: string, value: any): void {
    if (!this.celesteSynth) return;

    switch (id) {
      case 'attack':
        this.celesteSynth.envelope.attack = value;
        break;
      case 'decay':
        this.celesteSynth.envelope.decay = value;
        break;
      case 'sustain':
        this.celesteSynth.envelope.sustain = value;
        break;
      case 'release':
        this.celesteSynth.envelope.release = value;
        break;
      case 'harmonicity':
        this.celesteSynth.harmonicity.value = value;
        break;
      case 'modulation_index':
        this.celesteSynth.modulationIndex.value = value;
        break;
      case 'mod_release':
        this.celesteSynth.modulationEnvelope.release = value;
        break;
      case 'vibrato_rate':
        if (this.vibrato) this.vibrato.frequency.value = value;
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

  dispose(): void {
    this.vibrato?.dispose();
    this.vibrato = null;
    super.dispose();
  }
}