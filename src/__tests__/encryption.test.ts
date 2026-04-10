import { encryptFile, decryptFile } from '../operations/encryption';
import { createInitialState } from '../state';
import { File, TotalCommanderError } from '../types';

function makeFile(path: string, content: string): File {
  return { name: 'file.txt', path, size: content.length, modificationDate: 0, isDirectory: false, permissions: 'rw-------', content };
}

function stateWithFile(path: string, content: string) {
  const state = createInitialState();
  state.fileSystem.set(path, makeFile(path, content));
  return state;
}

describe('encryptFile', () => {
  it('changes file content after encryption', () => {
    const state = stateWithFile('/secret.txt', 'hello world');
    const result = encryptFile(state, { path: '/secret.txt', key: 'mykey' });
    expect(result.fileSystem.get('/secret.txt')?.content).not.toEqual('hello world');
  });

  it('does not mutate original state', () => {
    const state = stateWithFile('/secret.txt', 'hello world');
    encryptFile(state, { path: '/secret.txt', key: 'mykey' });
    expect(state.fileSystem.get('/secret.txt')?.content).toBe('hello world');
  });

  it('throws NOT_FOUND for missing file', () => {
    const state = createInitialState();
    expect(() => encryptFile(state, { path: '/missing.txt', key: 'key' })).toThrow(TotalCommanderError);
    try { encryptFile(state, { path: '/missing.txt', key: 'key' }); }
    catch(e) { expect((e as TotalCommanderError).code).toBe('NOT_FOUND'); }
  });

  it('throws INVALID_KEY for empty key', () => {
    const state = stateWithFile('/file.txt', 'data');
    expect(() => encryptFile(state, { path: '/file.txt', key: '' })).toThrow(TotalCommanderError);
    try { encryptFile(state, { path: '/file.txt', key: '' }); }
    catch(e) { expect((e as TotalCommanderError).code).toBe('INVALID_KEY'); }
  });
});

describe('decryptFile', () => {
  it('decryption after encryption returns original content', () => {
    const original = 'hello world';
    let state = stateWithFile('/file.txt', original);
    state = encryptFile(state, { path: '/file.txt', key: 'mykey' });
    state = decryptFile(state, { path: '/file.txt', key: 'mykey' });
    const content = state.fileSystem.get('/file.txt')?.content;
    const str = Buffer.isBuffer(content) ? content.toString('utf8') : content as string;
    expect(str).toBe(original);
  });

  it('throws NOT_FOUND for missing file', () => {
    const state = createInitialState();
    expect(() => decryptFile(state, { path: '/missing.txt', key: 'key' })).toThrow(TotalCommanderError);
  });

  it('throws INVALID_KEY for empty key', () => {
    const state = stateWithFile('/file.txt', 'data');
    expect(() => decryptFile(state, { path: '/file.txt', key: '' })).toThrow(TotalCommanderError);
    try { decryptFile(state, { path: '/file.txt', key: '' }); }
    catch(e) { expect((e as TotalCommanderError).code).toBe('INVALID_KEY'); }
  });

  it('does not mutate original state', () => {
    const original = 'test content';
    let state = stateWithFile('/file.txt', original);
    state = encryptFile(state, { path: '/file.txt', key: 'k' });
    const encrypted = state.fileSystem.get('/file.txt')?.content;
    decryptFile(state, { path: '/file.txt', key: 'k' });
    expect(state.fileSystem.get('/file.txt')?.content).toEqual(encrypted);
  });

  it('wrong key produces different output than original', () => {
    const original = 'hello world';
    let state = stateWithFile('/file.txt', original);
    state = encryptFile(state, { path: '/file.txt', key: 'rightkey' });
    state = decryptFile(state, { path: '/file.txt', key: 'wrongkey' });
    const content = state.fileSystem.get('/file.txt')?.content;
    const str = Buffer.isBuffer(content) ? content.toString('utf8') : content as string;
    expect(str).not.toBe(original);
  });
});
