import { AppState, ExecutePluginInput, ExecutePluginOutput, TotalCommanderError } from '../types';

export function executePlugin(state: AppState, input: ExecutePluginInput): ExecutePluginOutput {
  const { pluginId, input: inputFile } = input;
  if (!state.activePlugins.has(pluginId)) {
    throw new TotalCommanderError(`Plugin not active: ${pluginId}`, 'PLUGIN_NOT_ACTIVE');
  }
  if (!state.plugins.has(pluginId)) {
    throw new TotalCommanderError(`Plugin not found: ${pluginId}`, 'PLUGIN_NOT_FOUND');
  }
  // Plugin-specific logic: pass-through for base implementation
  return { output: { ...inputFile } };
}

export function activatePlugin(state: AppState, pluginId: string): AppState {
  if (!state.plugins.has(pluginId)) {
    throw new TotalCommanderError(`Plugin not found: ${pluginId}`, 'PLUGIN_NOT_FOUND');
  }
  const next = { ...state, activePlugins: new Set(state.activePlugins) };
  next.activePlugins.add(pluginId);
  return next;
}

export function deactivatePlugin(state: AppState, pluginId: string): AppState {
  const next = { ...state, activePlugins: new Set(state.activePlugins) };
  next.activePlugins.delete(pluginId);
  return next;
}
