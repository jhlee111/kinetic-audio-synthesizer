import { InstrumentPlugin } from '../types/plugin';
import { OasisPlugin } from './instruments/OasisPlugin';
import { CelestePlugin } from './instruments/CelestePlugin';
import { StarlightPlugin } from './instruments/StarlightPlugin';
import { WarmLeadPlugin } from './instruments/WarmLeadPlugin';
import { IndianFlutePlugin } from './instruments/IndianFlutePlugin';

export type PluginFactory = () => InstrumentPlugin;

// Registry of plugin factories
export const pluginFactories: Record<string, PluginFactory> = {
  'oasis': () => new OasisPlugin(),
  'celeste': () => new CelestePlugin(),
  'starlight': () => new StarlightPlugin(),
  'warmlead': () => new WarmLeadPlugin(),
  'indianflute': () => new IndianFlutePlugin()
};

// Get a fresh instance of a plugin
export function createPluginInstance(pluginId: string): InstrumentPlugin | null {
  const factory = pluginFactories[pluginId];
  if (!factory) {
    console.error(`No factory found for plugin: ${pluginId}`);
    return null;
  }
  return factory();
}