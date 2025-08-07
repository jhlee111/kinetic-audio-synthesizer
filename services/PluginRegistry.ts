import * as Tone from 'tone';
import { InstrumentPlugin, PluginRegistryEntry, PluginCategory } from '../types/plugin';
import { createPluginInstance } from '../plugins/PluginFactory';

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, PluginRegistryEntry> = new Map();
  private loadedPlugins: Map<string, InstrumentPlugin> = new Map();
  private isInitialized = false;

  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  registerPlugin(plugin: InstrumentPlugin): void {
    const entry: PluginRegistryEntry = {
      plugin,
      loadTime: new Date()
    };
    this.plugins.set(plugin.id, entry);
    console.log(`Registered plugin: ${plugin.name} (${plugin.id})`);
  }

  async loadPlugin(id: string): Promise<InstrumentPlugin | null> {
    // First, unload any existing instance
    if (this.loadedPlugins.has(id)) {
      this.unloadPlugin(id);
    }

    try {
      // Create a fresh instance using the factory
      const pluginInstance = createPluginInstance(id);
      if (!pluginInstance) {
        console.warn(`Failed to create plugin instance: ${id}`);
        return null;
      }
      
      await pluginInstance.initialize(Tone.getContext());
      this.loadedPlugins.set(id, pluginInstance);
      
      const entry = this.plugins.get(id);
      if (entry) {
        entry.instance = pluginInstance;
      }
      
      console.log(`Loaded fresh plugin instance: ${pluginInstance.name}`);
      return pluginInstance;
    } catch (error) {
      console.error(`Failed to load plugin ${id}:`, error);
      return null;
    }
  }

  unloadPlugin(id: string): void {
    const loadedPlugin = this.loadedPlugins.get(id);
    if (loadedPlugin) {
      loadedPlugin.dispose();
      this.loadedPlugins.delete(id);
      
      const entry = this.plugins.get(id);
      if (entry) {
        entry.instance = undefined;
      }
      
      console.log(`Unloaded plugin: ${id}`);
    }
  }

  unloadAllPlugins(): void {
    this.loadedPlugins.forEach((plugin, id) => {
      this.unloadPlugin(id);
    });
  }

  getAvailablePlugins(): InstrumentPlugin[] {
    return Array.from(this.plugins.values()).map(entry => entry.plugin);
  }

  getLoadedPlugins(): InstrumentPlugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  getPluginsByCategory(category: PluginCategory): InstrumentPlugin[] {
    return this.getAvailablePlugins().filter(plugin => plugin.category === category);
  }

  getPluginById(id: string): InstrumentPlugin | null {
    const entry = this.plugins.get(id);
    return entry ? entry.plugin : null;
  }

  getLoadedPluginById(id: string): InstrumentPlugin | null {
    return this.loadedPlugins.get(id) || null;
  }

  hasPlugin(id: string): boolean {
    return this.plugins.has(id);
  }

  isPluginLoaded(id: string): boolean {
    return this.loadedPlugins.has(id);
  }

  getPluginStats(): {
    total: number;
    loaded: number;
    categories: Record<PluginCategory, number>;
  } {
    const plugins = this.getAvailablePlugins();
    const categories: Record<PluginCategory, number> = {
      synth: 0,
      organic: 0,
      fx: 0,
      experimental: 0
    };

    plugins.forEach(plugin => {
      categories[plugin.category]++;
    });

    return {
      total: plugins.length,
      loaded: this.loadedPlugins.size,
      categories
    };
  }

  // Cleanup method
  dispose(): void {
    this.unloadAllPlugins();
    this.plugins.clear();
    this.isInitialized = false;
  }
}