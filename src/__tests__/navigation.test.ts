import { navigate } from '../operations/navigation';
import { createInitialState } from '../state';
import { TotalCommanderError } from '../types';

describe('navigate', () => {
  it('navigates left panel to new path', () => {
    const state = createInitialState();
    const result = navigate(state, { newPath: '/sdcard/Documents', panel: 'left' });
    expect(result.currentPathLeft).toBe('/sdcard/Documents');
  });

  it('navigates right panel to new path', () => {
    const state = createInitialState();
    const result = navigate(state, { newPath: '/sdcard/Downloads', panel: 'right' });
    expect(result.currentPathRight).toBe('/sdcard/Downloads');
  });

  it('does not modify the other panel when navigating left', () => {
    const state = createInitialState();
    const result = navigate(state, { newPath: '/new/path', panel: 'left' });
    expect(result.currentPathRight).toBe(state.currentPathRight);
  });

  it('does not modify the other panel when navigating right', () => {
    const state = createInitialState();
    const result = navigate(state, { newPath: '/new/path', panel: 'right' });
    expect(result.currentPathLeft).toBe(state.currentPathLeft);
  });

  it('appends new path to history', () => {
    const state = createInitialState();
    const result = navigate(state, { newPath: '/sdcard/Music', panel: 'left' });
    expect(result.history).toContain('/sdcard/Music');
    expect(result.history).toHaveLength(1);
  });

  it('accumulates history across multiple navigations', () => {
    let state = createInitialState();
    state = navigate(state, { newPath: '/path1', panel: 'left' });
    state = navigate(state, { newPath: '/path2', panel: 'right' });
    state = navigate(state, { newPath: '/path3', panel: 'left' });
    expect(state.history).toEqual(['/path1', '/path2', '/path3']);
  });

  it('does not mutate original state', () => {
    const state = createInitialState();
    navigate(state, { newPath: '/new/path', panel: 'left' });
    expect(state.currentPathLeft).toBe('/sdcard/');
    expect(state.history).toHaveLength(0);
  });

  it('throws TotalCommanderError for empty path', () => {
    const state = createInitialState();
    expect(() => navigate(state, { newPath: '', panel: 'left' })).toThrow(TotalCommanderError);
  });

  it('throws error with code INVALID_PATH for empty path', () => {
    const state = createInitialState();
    try {
      navigate(state, { newPath: '', panel: 'left' });
    } catch (e) {
      expect((e as TotalCommanderError).code).toBe('INVALID_PATH');
    }
  });

  it('throws TotalCommanderError for whitespace-only path', () => {
    const state = createInitialState();
    expect(() => navigate(state, { newPath: '   ', panel: 'left' })).toThrow(TotalCommanderError);
  });

  it('handles root path navigation', () => {
    const state = createInitialState();
    const result = navigate(state, { newPath: '/', panel: 'left' });
    expect(result.currentPathLeft).toBe('/');
  });

  it('preserves file system state during navigation', () => {
    const state = createInitialState();
    state.fileSystem.set('/file.txt', { name: 'file.txt', path: '/file.txt', size: 100, modificationDate: 0, isDirectory: false, permissions: 'rw-r--r--', content: 'hello' });
    const result = navigate(state, { newPath: '/other', panel: 'left' });
    expect(result.fileSystem.has('/file.txt')).toBe(true);
  });
});
