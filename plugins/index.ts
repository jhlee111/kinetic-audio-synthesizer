// Plugin exports
export { BaseInstrumentPlugin } from './base/BaseInstrumentPlugin';

// Built-in instrument plugins
export { OasisPlugin } from './instruments/OasisPlugin';
export { CelestePlugin } from './instruments/CelestePlugin';
export { StarlightPlugin } from './instruments/StarlightPlugin';
export { WarmLeadPlugin } from './instruments/WarmLeadPlugin';
export { IndianFlutePlugin } from './instruments/IndianFlutePlugin';

// Plugin registry
export { PluginRegistry } from '../services/PluginRegistry';

// Plugin types
export * from '../types/plugin';