import * as Tone from 'tone';
import { PluginRegistry } from './PluginRegistry';
import { InstrumentPlugin } from '../types/plugin';
import { 
  OasisPlugin, 
  CelestePlugin, 
  StarlightPlugin, 
  WarmLeadPlugin, 
  IndianFlutePlugin 
} from '../plugins';

export type InstrumentName = 'oasis' | 'celeste' | 'starlight' | 'warmlead' | 'indianflute';

class AudioService {
  private pluginRegistry = PluginRegistry.getInstance();
  private currentPlugin: InstrumentPlugin | null = null;
  private isInitialized = false;

  public async init() {
    if (this.isInitialized) return;
    try {
      // Note: Tone.start() will be called when user interacts with the page
      // to satisfy Chrome's autoplay policy
      
      // Lower master volume to create headroom for effects
      Tone.getDestination().volume.value = -9;

      // Initialize plugin registry
      await this.pluginRegistry.initialize();
      
      // Register built-in plugins
      await this.registerBuiltInPlugins();
      
      // Mark as initialized before setting instrument
      this.isInitialized = true;
      
      // Set default instrument
      await this.setInstrument('starlight');
      
    } catch (e) {
      console.error("Could not initialize Tone.js or plugins", e);
      this.isInitialized = false;
    }
  }
  
  public async ensureAudioContextStarted(): Promise<void> {
    // Start audio context on user interaction
    if (Tone.context.state !== 'running') {
      await Tone.start();
      console.log('Audio context started');
    }
  }
  
  private async registerBuiltInPlugins(): Promise<void> {
    // Register all built-in plugins (these are just templates, not instances)
    // The actual instances will be created when loaded via the factory
    const pluginTemplates = [
      new OasisPlugin(),
      new CelestePlugin(),
      new StarlightPlugin(),
      new WarmLeadPlugin(),
      new IndianFlutePlugin()
    ];
    
    pluginTemplates.forEach(plugin => {
      this.pluginRegistry.registerPlugin(plugin);
    });
    
    console.log('Built-in plugins registered:', this.pluginRegistry.getPluginStats());
  }
  
  public async setInstrument(type: InstrumentName): Promise<void> {
    if (!this.isInitialized) {
      console.warn(`AudioService not initialized, cannot set instrument: ${type}`);
      return;
    }

    console.log(`Setting instrument to: ${type}`);

    // Stop current plugin if playing
    if (this.currentPlugin) {
      console.log(`Stopping current plugin: ${this.currentPlugin.id}`);
      this.currentPlugin.stop();
    }
    
    // Load new plugin
    this.currentPlugin = await this.pluginRegistry.loadPlugin(type);
    if (!this.currentPlugin) {
      console.error(`Failed to load plugin: ${type}`);
    } else {
      console.log(`Successfully set instrument to: ${this.currentPlugin.name}`);
    }
  }
  
  public stop() {
    if (this.currentPlugin) {
      this.currentPlugin.stop();
    }
  }

  public update(frequency: number, gain: number) {
    if (!this.isInitialized || !this.currentPlugin || !isFinite(frequency)) {
      return;
    }
    
    this.currentPlugin.processHandData(frequency, gain);
  }
  
  public rampToGain(gainValue: number, _duration: number) {
      if (gainValue < 0.01 && this.currentPlugin?.isPlaying()) {
        this.stop();
      }
  }
  
  // Plugin system methods
  public getAvailableInstruments(): InstrumentPlugin[] {
    return this.pluginRegistry.getAvailablePlugins();
  }
  
  public getCurrentPlugin(): InstrumentPlugin | null {
    return this.currentPlugin;
  }
  
  public getPluginRegistry(): PluginRegistry {
    return this.pluginRegistry;
  }
  
  // Cleanup method
  public dispose(): void {
    this.pluginRegistry.dispose();
    this.currentPlugin = null;
    this.isInitialized = false;
  }
}

export const audioService = new AudioService();