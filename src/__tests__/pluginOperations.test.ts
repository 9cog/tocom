import { executePlugin, activatePlugin, deactivatePlugin } from '../operations/pluginOperations';
import { createInitialState } from '../state';
import { File, Plugin, TotalCommanderError } from '../types';

function makePlugin(id: string): Plugin {
  return { id, name: `Plugin ${id}`, type: 'filesystem', capabilities: new Set(['list', 'copy']) };
}

function makeFile(path: string): File {
  return { name: 'test.txt', path, size: 10, modificationDate: 0, isDirectory: false, permissions: 'r--r--r--', content: 'data' };
}

function stateWithPlugin(id: string, active = true) {
  const state = createInitialState();
  state.plugins.set(id, makePlugin(id));
  if (active) state.activePlugins.add(id);
  return state;
}

describe('executePlugin', () => {
  it('returns output file for active plugin', () => {
    const state = stateWithPlugin('dropbox');
    const input = makeFile('/cloud/file.txt');
    const result = executePlugin(state, { pluginId: 'dropbox', input });
    expect(result.output).toBeDefined();
    expect(result.output.path).toBe('/cloud/file.txt');
  });

  it('throws PLUGIN_NOT_ACTIVE for inactive plugin', () => {
    const state = stateWithPlugin('dropbox', false);
    const input = makeFile('/file.txt');
    expect(() => executePlugin(state, { pluginId: 'dropbox', input })).toThrow(TotalCommanderError);
    try { executePlugin(state, { pluginId: 'dropbox', input }); }
    catch(e) { expect((e as TotalCommanderError).code).toBe('PLUGIN_NOT_ACTIVE'); }
  });

  it('throws PLUGIN_NOT_FOUND for unknown plugin', () => {
    const state = createInitialState();
    state.activePlugins.add('ghost');
    const input = makeFile('/file.txt');
    expect(() => executePlugin(state, { pluginId: 'ghost', input })).toThrow(TotalCommanderError);
    try { executePlugin(state, { pluginId: 'ghost', input }); }
    catch(e) { expect((e as TotalCommanderError).code).toBe('PLUGIN_NOT_FOUND'); }
  });

  it('passes input file through to output', () => {
    const state = stateWithPlugin('p1');
    const input = makeFile('/some/path.txt');
    const { output } = executePlugin(state, { pluginId: 'p1', input });
    expect(output.name).toBe('test.txt');
    expect(output.content).toBe('data');
  });
});

describe('activatePlugin', () => {
  it('adds plugin to activePlugins set', () => {
    const state = stateWithPlugin('ftp', false);
    const result = activatePlugin(state, 'ftp');
    expect(result.activePlugins.has('ftp')).toBe(true);
  });

  it('throws PLUGIN_NOT_FOUND for unknown plugin', () => {
    const state = createInitialState();
    expect(() => activatePlugin(state, 'unknown')).toThrow(TotalCommanderError);
    try { activatePlugin(state, 'unknown'); }
    catch(e) { expect((e as TotalCommanderError).code).toBe('PLUGIN_NOT_FOUND'); }
  });

  it('does not mutate original state', () => {
    const state = stateWithPlugin('ftp', false);
    activatePlugin(state, 'ftp');
    expect(state.activePlugins.has('ftp')).toBe(false);
  });

  it('activating already-active plugin is idempotent', () => {
    const state = stateWithPlugin('ftp', true);
    const result = activatePlugin(state, 'ftp');
    expect(result.activePlugins.has('ftp')).toBe(true);
    expect(result.activePlugins.size).toBe(1);
  });
});

describe('deactivatePlugin', () => {
  it('removes plugin from activePlugins set', () => {
    const state = stateWithPlugin('ftp', true);
    const result = deactivatePlugin(state, 'ftp');
    expect(result.activePlugins.has('ftp')).toBe(false);
  });

  it('does not throw when deactivating inactive plugin', () => {
    const state = stateWithPlugin('ftp', false);
    expect(() => deactivatePlugin(state, 'ftp')).not.toThrow();
  });

  it('does not mutate original state', () => {
    const state = stateWithPlugin('ftp', true);
    deactivatePlugin(state, 'ftp');
    expect(state.activePlugins.has('ftp')).toBe(true);
  });
});
