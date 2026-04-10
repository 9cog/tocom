export type PATH = string;
export type FILENAME = string;
export type PERMISSIONS = string;
export type PLUGIN_ID = string;
export type PLUGIN_TYPE = 'filesystem' | 'content' | 'remote';
export type CONTENT = Buffer | string;

export interface File {
  name: FILENAME;
  path: PATH;
  size: number;
  modificationDate: number;
  isDirectory: boolean;
  permissions: PERMISSIONS;
  content: CONTENT;
}

export interface Plugin {
  id: PLUGIN_ID;
  name: string;
  type: PLUGIN_TYPE;
  capabilities: Set<string>;
}

export interface AppState {
  currentPathLeft: PATH;
  currentPathRight: PATH;
  selectedItemsLeft: Set<FILENAME>;
  selectedItemsRight: Set<FILENAME>;
  fileSystem: Map<PATH, File>;
  plugins: Map<PLUGIN_ID, Plugin>;
  activePlugins: Set<PLUGIN_ID>;
  history: PATH[];
}

export type Panel = 'left' | 'right';

export interface NavigateInput {
  newPath: PATH;
  panel: Panel;
}

export interface CopyFileInput {
  sourcePath: PATH;
  destPath: PATH;
}

export interface MoveFileInput {
  sourcePath: PATH;
  destPath: PATH;
}

export interface DeleteFileInput {
  path: PATH;
}

export interface EncryptFileInput {
  path: PATH;
  key: string;
}

export interface DecryptFileInput {
  path: PATH;
  key: string;
}

export interface ExecutePluginInput {
  pluginId: PLUGIN_ID;
  input: File;
}

export interface ExecutePluginOutput {
  output: File;
}

export class TotalCommanderError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'TotalCommanderError';
  }
}
