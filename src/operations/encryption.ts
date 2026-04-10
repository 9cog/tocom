import { AppState, EncryptFileInput, DecryptFileInput, TotalCommanderError, CONTENT } from '../types';
import { cloneState } from '../state';

function xorContent(content: CONTENT, key: string): Buffer {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content as string, 'utf8');
  const keyBuf = Buffer.from(key, 'utf8');
  const result = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    result[i] = buf[i] ^ keyBuf[i % keyBuf.length];
  }
  return result;
}

export function encryptFile(state: AppState, input: EncryptFileInput): AppState {
  const { path, key } = input;
  if (!key || key.length === 0) {
    throw new TotalCommanderError('Encryption key cannot be empty', 'INVALID_KEY');
  }
  if (!state.fileSystem.has(path)) {
    throw new TotalCommanderError(`Path not found: ${path}`, 'NOT_FOUND');
  }
  const next = cloneState(state);
  const file = state.fileSystem.get(path)!;
  next.fileSystem.set(path, { ...file, content: xorContent(file.content, key) });
  return next;
}

export function decryptFile(state: AppState, input: DecryptFileInput): AppState {
  const { path, key } = input;
  if (!key || key.length === 0) {
    throw new TotalCommanderError('Decryption key cannot be empty', 'INVALID_KEY');
  }
  if (!state.fileSystem.has(path)) {
    throw new TotalCommanderError(`Path not found: ${path}`, 'NOT_FOUND');
  }
  const next = cloneState(state);
  const file = state.fileSystem.get(path)!;
  next.fileSystem.set(path, { ...file, content: xorContent(file.content, key) });
  return next;
}
