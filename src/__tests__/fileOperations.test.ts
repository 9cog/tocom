import { copyFile, moveFile, deleteFile } from '../operations/fileOperations';
import { createInitialState } from '../state';
import { File, TotalCommanderError } from '../types';

function makeFile(path: string, name?: string): File {
  return {
    name: name ?? path.split('/').pop() ?? path,
    path,
    size: 42,
    modificationDate: 1700000000,
    isDirectory: false,
    permissions: 'rw-r--r--',
    content: `content of ${path}`,
  };
}

function stateWithFile(path: string) {
  const state = createInitialState();
  state.fileSystem.set(path, makeFile(path));
  return state;
}

// --- copyFile ---
describe('copyFile', () => {
  it('copies file to new path', () => {
    const state = stateWithFile('/src/file.txt');
    const result = copyFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/file.txt' });
    expect(result.fileSystem.has('/dst/file.txt')).toBe(true);
  });

  it('preserves source file after copy', () => {
    const state = stateWithFile('/src/file.txt');
    const result = copyFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/file.txt' });
    expect(result.fileSystem.has('/src/file.txt')).toBe(true);
  });

  it('copies file content correctly', () => {
    const state = stateWithFile('/src/file.txt');
    const result = copyFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/file.txt' });
    expect(result.fileSystem.get('/dst/file.txt')?.content).toBe('content of /src/file.txt');
  });

  it('sets correct name on copied file', () => {
    const state = stateWithFile('/src/file.txt');
    const result = copyFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/newname.txt' });
    expect(result.fileSystem.get('/dst/newname.txt')?.name).toBe('newname.txt');
  });

  it('throws SOURCE_NOT_FOUND when source does not exist', () => {
    const state = createInitialState();
    expect(() => copyFile(state, { sourcePath: '/missing.txt', destPath: '/dst.txt' })).toThrow(TotalCommanderError);
    try {
      copyFile(state, { sourcePath: '/missing.txt', destPath: '/dst.txt' });
    } catch(e) { expect((e as TotalCommanderError).code).toBe('SOURCE_NOT_FOUND'); }
  });

  it('throws DEST_EXISTS when destination already exists', () => {
    const state = createInitialState();
    state.fileSystem.set('/src.txt', makeFile('/src.txt'));
    state.fileSystem.set('/dst.txt', makeFile('/dst.txt'));
    expect(() => copyFile(state, { sourcePath: '/src.txt', destPath: '/dst.txt' })).toThrow(TotalCommanderError);
    try {
      copyFile(state, { sourcePath: '/src.txt', destPath: '/dst.txt' });
    } catch(e) { expect((e as TotalCommanderError).code).toBe('DEST_EXISTS'); }
  });

  it('does not mutate original state', () => {
    const state = stateWithFile('/src/file.txt');
    copyFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/file.txt' });
    expect(state.fileSystem.has('/dst/file.txt')).toBe(false);
  });

  it('preserves file size on copy', () => {
    const state = stateWithFile('/src/file.txt');
    const result = copyFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/file.txt' });
    expect(result.fileSystem.get('/dst/file.txt')?.size).toBe(42);
  });

  it('preserves file permissions on copy', () => {
    const state = stateWithFile('/src/file.txt');
    const result = copyFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/file.txt' });
    expect(result.fileSystem.get('/dst/file.txt')?.permissions).toBe('rw-r--r--');
  });
});

// --- moveFile ---
describe('moveFile', () => {
  it('moves file to new path', () => {
    const state = stateWithFile('/src/file.txt');
    const result = moveFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/file.txt' });
    expect(result.fileSystem.has('/dst/file.txt')).toBe(true);
  });

  it('removes source file after move', () => {
    const state = stateWithFile('/src/file.txt');
    const result = moveFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/file.txt' });
    expect(result.fileSystem.has('/src/file.txt')).toBe(false);
  });

  it('preserves file content after move', () => {
    const state = stateWithFile('/src/file.txt');
    const result = moveFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/file.txt' });
    expect(result.fileSystem.get('/dst/file.txt')?.content).toBe('content of /src/file.txt');
  });

  it('throws SOURCE_NOT_FOUND when source does not exist', () => {
    const state = createInitialState();
    expect(() => moveFile(state, { sourcePath: '/missing.txt', destPath: '/dst.txt' })).toThrow(TotalCommanderError);
  });

  it('throws DEST_EXISTS when destination already exists', () => {
    const state = createInitialState();
    state.fileSystem.set('/src.txt', makeFile('/src.txt'));
    state.fileSystem.set('/dst.txt', makeFile('/dst.txt'));
    expect(() => moveFile(state, { sourcePath: '/src.txt', destPath: '/dst.txt' })).toThrow(TotalCommanderError);
  });

  it('does not mutate original state', () => {
    const state = stateWithFile('/src/file.txt');
    moveFile(state, { sourcePath: '/src/file.txt', destPath: '/dst/file.txt' });
    expect(state.fileSystem.has('/src/file.txt')).toBe(true);
    expect(state.fileSystem.has('/dst/file.txt')).toBe(false);
  });

  it('total file count stays same after move', () => {
    const state = createInitialState();
    state.fileSystem.set('/src.txt', makeFile('/src.txt'));
    state.fileSystem.set('/other.txt', makeFile('/other.txt'));
    const result = moveFile(state, { sourcePath: '/src.txt', destPath: '/moved.txt' });
    expect(result.fileSystem.size).toBe(2);
  });
});

// --- deleteFile ---
describe('deleteFile', () => {
  it('removes file from file system', () => {
    const state = stateWithFile('/file.txt');
    const result = deleteFile(state, { path: '/file.txt' });
    expect(result.fileSystem.has('/file.txt')).toBe(false);
  });

  it('throws NOT_FOUND when path does not exist', () => {
    const state = createInitialState();
    expect(() => deleteFile(state, { path: '/missing.txt' })).toThrow(TotalCommanderError);
    try {
      deleteFile(state, { path: '/missing.txt' });
    } catch(e) { expect((e as TotalCommanderError).code).toBe('NOT_FOUND'); }
  });

  it('does not remove other files', () => {
    const state = createInitialState();
    state.fileSystem.set('/a.txt', makeFile('/a.txt'));
    state.fileSystem.set('/b.txt', makeFile('/b.txt'));
    const result = deleteFile(state, { path: '/a.txt' });
    expect(result.fileSystem.has('/b.txt')).toBe(true);
  });

  it('does not mutate original state', () => {
    const state = stateWithFile('/file.txt');
    deleteFile(state, { path: '/file.txt' });
    expect(state.fileSystem.has('/file.txt')).toBe(true);
  });

  it('reduces file system size by 1', () => {
    const state = createInitialState();
    state.fileSystem.set('/a.txt', makeFile('/a.txt'));
    state.fileSystem.set('/b.txt', makeFile('/b.txt'));
    const result = deleteFile(state, { path: '/a.txt' });
    expect(result.fileSystem.size).toBe(1);
  });
});
