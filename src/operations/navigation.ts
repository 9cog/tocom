import { AppState, NavigateInput, TotalCommanderError } from '../types';
import { cloneState } from '../state';

export function navigate(state: AppState, input: NavigateInput): AppState {
  const { newPath, panel } = input;
  if (!newPath || newPath.trim() === '') {
    throw new TotalCommanderError('Path cannot be empty', 'INVALID_PATH');
  }
  const next = cloneState(state);
  if (panel === 'left') {
    next.currentPathLeft = newPath;
  } else {
    next.currentPathRight = newPath;
  }
  next.history = [...state.history, newPath];
  return next;
}
