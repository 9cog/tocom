import { AppState, CopyFileInput, MoveFileInput, DeleteFileInput, TotalCommanderError } from '../types';
import { cloneState } from '../state';

export function copyFile(state: AppState, input: CopyFileInput): AppState {
  const { sourcePath, destPath } = input;
  if (!state.fileSystem.has(sourcePath)) {
    throw new TotalCommanderError(`Source path not found: ${sourcePath}`, 'SOURCE_NOT_FOUND');
  }
  if (state.fileSystem.has(destPath)) {
    throw new TotalCommanderError(`Destination path already exists: ${destPath}`, 'DEST_EXISTS');
  }
  const next = cloneState(state);
  const sourceFile = state.fileSystem.get(sourcePath)!;
  next.fileSystem.set(destPath, { ...sourceFile, path: destPath, name: destPath.split('/').pop() || sourceFile.name });
  return next;
}

export function moveFile(state: AppState, input: MoveFileInput): AppState {
  const { sourcePath, destPath } = input;
  if (!state.fileSystem.has(sourcePath)) {
    throw new TotalCommanderError(`Source path not found: ${sourcePath}`, 'SOURCE_NOT_FOUND');
  }
  if (state.fileSystem.has(destPath)) {
    throw new TotalCommanderError(`Destination path already exists: ${destPath}`, 'DEST_EXISTS');
  }
  const next = cloneState(state);
  const sourceFile = state.fileSystem.get(sourcePath)!;
  next.fileSystem.set(destPath, { ...sourceFile, path: destPath, name: destPath.split('/').pop() || sourceFile.name });
  next.fileSystem.delete(sourcePath);
  return next;
}

export function deleteFile(state: AppState, input: DeleteFileInput): AppState {
  const { path } = input;
  if (!state.fileSystem.has(path)) {
    throw new TotalCommanderError(`Path not found: ${path}`, 'NOT_FOUND');
  }
  const next = cloneState(state);
  next.fileSystem.delete(path);
  return next;
}
