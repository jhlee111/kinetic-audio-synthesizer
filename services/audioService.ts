import * as Tone from 'tone';

export type InstrumentName = 'oasis' | 'celeste' | 'starlight' | 'warmlead';

type SynthType = Tone.Synth | Tone.FMSynth | Tone.MonoSynth;

class AudioService {
  private synths: Map<InstrumentName, SynthType> = new Map();
  private activeSynth: SynthType | null = null;
  private isInitialized = false;
  private isPlaying = false;

  // Effects chain nodes
  private chorus: Tone.Chorus | null = null;
  private delay: Tone.PingPongDelay | null = null;
  private reverb: Tone.Reverb | null = null;

  public async init() {
    if (this.isInitialized) return;
    try {
      await Tone.start();
      // Lower master volume to create headroom for effects
      Tone.getDestination().volume.value = -9;

      // 1. Create shared effects chain and connect it to the master output
      this.reverb = new Tone.Reverb({
        decay: 4,
        preDelay: 0.01,
        wet: 0.5
      }).toDestination();

      this.delay = new Tone.PingPongDelay({
        delayTime: "8n.", // Dotted eighth note delay
        feedback: 0.4,
        wet: 0.3
      }).connect(this.reverb);

      this.chorus = new Tone.Chorus({
        frequency: 1.5,
        delayTime: 3.5,
        depth: 0.7,
        wet: 0.4
      }).connect(this.delay);
      
      const effectInput = this.chorus; // All synths will feed into the chorus first

      // 2. Re-define instruments with richer sounds and connect them to the effects chain
      
      // Oasis: Upgraded to a richer, wider sound with FatOscillator
      const oasisSynth = new Tone.Synth({
        oscillator: { type: 'fatsine', spread: 40, count: 3 }, // Was 'sine'
        envelope: { attack: 0.2, decay: 0.3, sustain: 0.7, release: 2 } // Longer release
      }).connect(effectInput);
      this.synths.set('oasis', oasisSynth);
      
      // Celeste: Add a subtle vibrato for more life
      const celesteSynth = new Tone.FMSynth({
        harmonicity: 3.01, modulationIndex: 14,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 1.5 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.02, decay: 0.3, sustain: 0, release: 0.8 }
      }).connect(effectInput);
      // Vibrato LFO to make it shimmer
      const vibrato = new Tone.LFO('6hz', -5, 5).start();
      vibrato.connect(celesteSynth.detune);
      this.synths.set('celeste', celesteSynth);

      // Starlight: More atmospheric with tweaked settings for pads
      const starlightSynth = new Tone.FMSynth({
        harmonicity: 1.5,
        modulationIndex: 20,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.8, decay: 0.1, sustain: 0.7, release: 2.5 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 1.2, decay: 0, sustain: 1, release: 2.5 },
      }).connect(effectInput);
      this.synths.set('starlight', starlightSynth);

      // Warm Lead: Connect to effects chain for more presence
      const warmLeadSynth = new Tone.MonoSynth({
        portamento: 0.01,
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.8 },
        filter: { Q: 4, type: "lowpass", rolloff: -24 },
        filterEnvelope: { attack: 0.01, decay: 0.7, sustain: 0.1, release: 1, baseFrequency: 300, octaves: 5 },
      }).connect(effectInput);
      this.synths.set('warmlead', warmLeadSynth);
      
      this.activeSynth = this.synths.get('oasis')!;
      this.isInitialized = true;
    } catch (e) {
      console.error("Could not initialize Tone.js", e);
    }
  }
  
  public setInstrument(type: InstrumentName) {
    if (!this.synths.has(type)) return;

    // Stop all synthesizers to ensure a clean switch and prevent lingering sounds.
    this.synths.forEach(synth => {
      if (synth && typeof synth.triggerRelease === 'function') {
        synth.triggerRelease(Tone.now());
      }
    });
    
    this.activeSynth = this.synths.get(type)!;
    this.isPlaying = false;
  }
  
  public stop() {
    if (this.isPlaying) {
      this.activeSynth?.triggerRelease(Tone.now());
      this.isPlaying = false;
    }
  }

  public update(frequency: number, gain: number) {
    if (!this.isInitialized || !this.activeSynth || !isFinite(frequency)) return;
    
    const velocity = Math.max(0, Math.min(1, gain));

    if (velocity > 0.05 && !this.isPlaying) {
      this.activeSynth.triggerAttack(frequency, Tone.now(), velocity);
      this.isPlaying = true;
    } else if (velocity <= 0.05 && this.isPlaying) {
      this.activeSynth.triggerRelease(Tone.now());
      this.isPlaying = false;
    } else if (this.isPlaying) {
      if (this.activeSynth instanceof Tone.MonoSynth || this.activeSynth instanceof Tone.FMSynth) {
        // These synths have setNote for gliding
        this.activeSynth.setNote(frequency, Tone.now() + 0.02);
      } else if (this.activeSynth instanceof Tone.Synth) {
        // Tone.Synth doesn't have setNote, so we ramp the frequency directly
        this.activeSynth.frequency.rampTo(frequency, 0.05);
      }
    }
  }
  
  public rampToGain(gainValue: number, _duration: number) {
      if (gainValue < 0.01 && this.isPlaying) {
        this.stop();
      }
  }
}

export const audioService = new AudioService();