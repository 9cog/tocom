/**
 * E2E Integration Tests for Total Commander State Model
 * Simulates realistic user workflows end-to-end.
 */
import {
  createInitialState,
  navigate,
  copyFile,
  moveFile,
  deleteFile,
  encryptFile,
  decryptFile,
  executePlugin,
  activatePlugin,
  deactivatePlugin,
} from '../../index';
import { File, Plugin } from '../../types';

function makeFile(path: string, content = 'sample content'): File {
  return {
    name: path.split('/').pop() ?? path,
    path,
    size: content.length,
    modificationDate: Date.now(),
    isDirectory: false,
    permissions: 'rw-r--r--',
    content,
  };
}

function makePlugin(id: string): Plugin {
  return { id, name: `Plugin ${id}`, type: 'filesystem', capabilities: new Set(['list', 'read', 'write']) };
}

// --- E2E Scenario 1: Dual-pane file browsing ---
describe('E2E: Dual-pane browsing', () => {
  it('user navigates both panes independently', () => {
    let state = createInitialState();
    state = navigate(state, { newPath: '/sdcard/Documents', panel: 'left' });
    state = navigate(state, { newPath: '/sdcard/Downloads', panel: 'right' });
    expect(state.currentPathLeft).toBe('/sdcard/Documents');
    expect(state.currentPathRight).toBe('/sdcard/Downloads');
  });

  it('history records all navigation steps', () => {
    let state = createInitialState();
    state = navigate(state, { newPath: '/p1', panel: 'left' });
    state = navigate(state, { newPath: '/p2', panel: 'right' });
    state = navigate(state, { newPath: '/p3', panel: 'left' });
    expect(state.history).toHaveLength(3);
    expect(state.history[0]).toBe('/p1');
    expect(state.history[2]).toBe('/p3');
  });
});

// --- E2E Scenario 2: Copy files between panes ---
describe('E2E: Copy workflow', () => {
  it('user copies multiple files from left to right', () => {
    let state = createInitialState();
    state.fileSystem.set('/src/a.txt', makeFile('/src/a.txt', 'alpha'));
    state.fileSystem.set('/src/b.txt', makeFile('/src/b.txt', 'beta'));
    state = navigate(state, { newPath: '/src', panel: 'left' });
    state = navigate(state, { newPath: '/dst', panel: 'right' });
    state = copyFile(state, { sourcePath: '/src/a.txt', destPath: '/dst/a.txt' });
    state = copyFile(state, { sourcePath: '/src/b.txt', destPath: '/dst/b.txt' });
    expect(state.fileSystem.has('/src/a.txt')).toBe(true);
    expect(state.fileSystem.has('/dst/a.txt')).toBe(true);
    expect(state.fileSystem.has('/dst/b.txt')).toBe(true);
    expect(state.fileSystem.get('/dst/a.txt')?.content).toBe('alpha');
  });
});

// --- E2E Scenario 3: Move then delete ---
describe('E2E: Move and delete workflow', () => {
  it('user moves files then deletes original directory entry', () => {
    let state = createInitialState();
    state.fileSystem.set('/tmp/draft.txt', makeFile('/tmp/draft.txt', 'draft content'));
    state = moveFile(state, { sourcePath: '/tmp/draft.txt', destPath: '/docs/final.txt' });
    expect(state.fileSystem.has('/tmp/draft.txt')).toBe(false);
    expect(state.fileSystem.has('/docs/final.txt')).toBe(true);
  });

  it('user deletes multiple files in sequence', () => {
    let state = createInitialState();
    state.fileSystem.set('/trash/a.txt', makeFile('/trash/a.txt'));
    state.fileSystem.set('/trash/b.txt', makeFile('/trash/b.txt'));
    state.fileSystem.set('/trash/c.txt', makeFile('/trash/c.txt'));
    state = deleteFile(state, { path: '/trash/a.txt' });
    state = deleteFile(state, { path: '/trash/b.txt' });
    state = deleteFile(state, { path: '/trash/c.txt' });
    expect(state.fileSystem.size).toBe(0);
  });
});

// --- E2E Scenario 4: Encrypt and decrypt ---
describe('E2E: Encryption workflow', () => {
  it('user encrypts a file, sends it, then decrypts', () => {
    const plaintext = 'top secret document';
    let state = createInitialState();
    state.fileSystem.set('/private/doc.txt', makeFile('/private/doc.txt', plaintext));
    state = encryptFile(state, { path: '/private/doc.txt', key: 'securekey123' });
    const encrypted = state.fileSystem.get('/private/doc.txt')?.content;
    expect(encrypted).not.toBe(plaintext);
    state = decryptFile(state, { path: '/private/doc.txt', key: 'securekey123' });
    const decrypted = state.fileSystem.get('/private/doc.txt')?.content;
    const str = Buffer.isBuffer(decrypted) ? decrypted.toString('utf8') : decrypted as string;
    expect(str).toBe(plaintext);
  });

  it('encrypted file is copied and decrypted at destination', () => {
    const original = 'confidential data';
    let state = createInitialState();
    state.fileSystem.set('/src/secret.txt', makeFile('/src/secret.txt', original));
    state = encryptFile(state, { path: '/src/secret.txt', key: 'pass' });
    state = copyFile(state, { sourcePath: '/src/secret.txt', destPath: '/dst/secret.txt' });
    state = decryptFile(state, { path: '/dst/secret.txt', key: 'pass' });
    const content = state.fileSystem.get('/dst/secret.txt')?.content;
    const str = Buffer.isBuffer(content) ? content.toString('utf8') : content as string;
    expect(str).toBe(original);
  });
});

// --- E2E Scenario 5: Plugin lifecycle ---
describe('E2E: Plugin lifecycle', () => {
  it('user installs, activates, uses, and deactivates a plugin', () => {
    let state = createInitialState();
    state.plugins.set('dropbox', makePlugin('dropbox'));
    expect(state.activePlugins.has('dropbox')).toBe(false);
    state = activatePlugin(state, 'dropbox');
    expect(state.activePlugins.has('dropbox')).toBe(true);
    const inputFile = makeFile('/cloud/report.pdf');
    const { output } = executePlugin(state, { pluginId: 'dropbox', input: inputFile });
    expect(output).toBeDefined();
    state = deactivatePlugin(state, 'dropbox');
    expect(state.activePlugins.has('dropbox')).toBe(false);
  });

  it('multiple plugins can be active simultaneously', () => {
    let state = createInitialState();
    state.plugins.set('ftp', makePlugin('ftp'));
    state.plugins.set('sftp', makePlugin('sftp'));
    state = activatePlugin(state, 'ftp');
    state = activatePlugin(state, 'sftp');
    expect(state.activePlugins.size).toBe(2);
  });
});

// --- E2E Scenario 6: Complex multi-step workflow ---
describe('E2E: Full workflow - organize files', () => {
  it('user organizes, renames (move), encrypts sensitive files, and removes temp files', () => {
    let state = createInitialState();

    // Set up initial file system
    state.fileSystem.set('/downloads/invoice.pdf', makeFile('/downloads/invoice.pdf', 'invoice data'));
    state.fileSystem.set('/downloads/photo.jpg', makeFile('/downloads/photo.jpg', 'photo data'));
    state.fileSystem.set('/tmp/scratch.txt', makeFile('/tmp/scratch.txt', 'scratch data'));

    // Navigate
    state = navigate(state, { newPath: '/downloads', panel: 'left' });
    state = navigate(state, { newPath: '/documents', panel: 'right' });

    // Move invoice to documents
    state = moveFile(state, { sourcePath: '/downloads/invoice.pdf', destPath: '/documents/invoice.pdf' });
    expect(state.fileSystem.has('/downloads/invoice.pdf')).toBe(false);
    expect(state.fileSystem.has('/documents/invoice.pdf')).toBe(true);

    // Copy photo to backup
    state = copyFile(state, { sourcePath: '/downloads/photo.jpg', destPath: '/backup/photo.jpg' });
    expect(state.fileSystem.has('/downloads/photo.jpg')).toBe(true);
    expect(state.fileSystem.has('/backup/photo.jpg')).toBe(true);

    // Encrypt sensitive invoice
    state = encryptFile(state, { path: '/documents/invoice.pdf', key: 'invoicekey' });

    // Delete temp file
    state = deleteFile(state, { path: '/tmp/scratch.txt' });
    expect(state.fileSystem.has('/tmp/scratch.txt')).toBe(false);

    // Verify final state
    expect(state.fileSystem.size).toBe(3); // documents/invoice.pdf, downloads/photo.jpg, backup/photo.jpg
    expect(state.history).toHaveLength(2);
  });
});
