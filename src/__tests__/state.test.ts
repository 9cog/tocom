import { createInitialState, cloneState, DEFAULT_PATH } from '../state';

describe('createInitialState', () => {
  it('creates state with default left path', () => {
    const state = createInitialState();
    expect(state.currentPathLeft).toBe(DEFAULT_PATH);
  });

  it('creates state with default right path', () => {
    const state = createInitialState();
    expect(state.currentPathRight).toBe(DEFAULT_PATH);
  });

  it('creates empty selected items for left panel', () => {
    const state = createInitialState();
    expect(state.selectedItemsLeft.size).toBe(0);
  });

  it('creates empty selected items for right panel', () => {
    const state = createInitialState();
    expect(state.selectedItemsRight.size).toBe(0);
  });

  it('creates empty file system', () => {
    const state = createInitialState();
    expect(state.fileSystem.size).toBe(0);
  });

  it('creates empty plugins map', () => {
    const state = createInitialState();
    expect(state.plugins.size).toBe(0);
  });

  it('creates empty active plugins set', () => {
    const state = createInitialState();
    expect(state.activePlugins.size).toBe(0);
  });

  it('creates empty history', () => {
    const state = createInitialState();
    expect(state.history).toEqual([]);
  });
});

describe('cloneState', () => {
  it('creates a deep copy of the state', () => {
    const state = createInitialState();
    state.fileSystem.set('/test', { name: 'test', path: '/test', size: 0, modificationDate: 0, isDirectory: false, permissions: 'rw-r--r--', content: '' });
    const clone = cloneState(state);
    clone.fileSystem.delete('/test');
    expect(state.fileSystem.has('/test')).toBe(true);
  });

  it('copies history as a new array', () => {
    const state = createInitialState();
    state.history.push('/some/path');
    const clone = cloneState(state);
    clone.history.push('/other/path');
    expect(state.history).toHaveLength(1);
  });

  it('copies selectedItemsLeft as a new Set', () => {
    const state = createInitialState();
    state.selectedItemsLeft.add('file.txt');
    const clone = cloneState(state);
    clone.selectedItemsLeft.add('other.txt');
    expect(state.selectedItemsLeft.size).toBe(1);
  });

  it('copies activePlugins as a new Set', () => {
    const state = createInitialState();
    state.activePlugins.add('plugin1');
    const clone = cloneState(state);
    clone.activePlugins.add('plugin2');
    expect(state.activePlugins.size).toBe(1);
  });
});
