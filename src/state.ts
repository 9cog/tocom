import { AppState, PATH } from './types';

export const DEFAULT_PATH: PATH = '/sdcard/';

export function createInitialState(): AppState {
  return {
    currentPathLeft: DEFAULT_PATH,
    currentPathRight: DEFAULT_PATH,
    selectedItemsLeft: new Set(),
    selectedItemsRight: new Set(),
    fileSystem: new Map(),
    plugins: new Map(),
    activePlugins: new Set(),
    history: [],
  };
}

export function cloneState(state: AppState): AppState {
  return {
    currentPathLeft: state.currentPathLeft,
    currentPathRight: state.currentPathRight,
    selectedItemsLeft: new Set(state.selectedItemsLeft),
    selectedItemsRight: new Set(state.selectedItemsRight),
    fileSystem: new Map(state.fileSystem),
    plugins: new Map(state.plugins),
    activePlugins: new Set(state.activePlugins),
    history: [...state.history],
  };
}
