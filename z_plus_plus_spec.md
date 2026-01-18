# Total Commander for Android: A Z++ Formal Specification

This document provides a formal specification of the core components and operations of the Total Commander for Android application, using the Z++ notation. The specification is based on the analysis of the decompiled APK.

## 1. Introduction

Total Commander is a powerful file manager for Android that provides a wide range of features, including a dual-pane interface, support for various file types and archives, a plugin system for extensibility, and root functions for privileged operations. This specification aims to formally describe the key architectural components and their interactions to provide a clear and unambiguous understanding of the application's design.

## 2. Basic Types

[PATH, FILENAME, PERMISSIONS, PLUGIN_ID, PLUGIN_TYPE, CONTENT]

## 3. State Schema

The state of the Total Commander application can be modeled as follows:

```z
SCHEMA AppState
  current_path_left: PATH
  current_path_right: PATH
  selected_items_left: SET(FILENAME)
  selected_items_right: SET(FILENAME)
  file_system: PATH -> File
  plugins: PLUGIN_ID -> Plugin
  active_plugins: SET(PLUGIN_ID)
  history: SEQ(PATH)
```

### 3.1. File Schema

```z
SCHEMA File
  name: FILENAME
  path: PATH
  size: NAT
  modification_date: NAT
  is_directory: BOOL
  permissions: PERMISSIONS
  content: CONTENT
```

### 3.2. Plugin Schema

```z
SCHEMA Plugin
  id: PLUGIN_ID
  name: STRING
  type: PLUGIN_TYPE
  capabilities: SET(STRING)
```

## 4. Initial State

The initial state of the application is defined as:

```z
SCHEMA InitialState
  AppState
WHERE
  current_path_left = "/sdcard/"
  current_path_right = "/sdcard/"
  selected_items_left = {}
  selected_items_right = {}
  active_plugins = {}
  history = []
```

## 5. Operations

This section defines the formal specification for the core operations of the application.

### 5.1. Navigation

```z
SCHEMA Navigate
  DELTA AppState
  new_path?: PATH
  panel?: STRING
WHERE
  (panel? = "left" => current_path_left' = new_path?)
  (panel? = "right" => current_path_right' = new_path?)
  file_system' = file_system
  plugins' = plugins
  active_plugins' = active_plugins
  history' = history ^ [new_path?]
```

### 5.2. File Operations

#### 5.2.1. Copy File

```z
SCHEMA CopyFile
  DELTA AppState
  source_path?: PATH
  dest_path?: PATH
WHERE
  source_path? IN dom(file_system)
  dest_path? NOT IN dom(file_system)
  file_system' = file_system \/ {dest_path? -> file_system(source_path?)}
```

#### 5.2.2. Move File

```z
SCHEMA MoveFile
  DELTA AppState
  source_path?: PATH
  dest_path?: PATH
WHERE
  source_path? IN dom(file_system)
  dest_path? NOT IN dom(file_system)
  file_system' = (file_system \ {source_path?}) \/ {dest_path? -> file_system(source_path?)}
```

#### 5.2.3. Delete File

```z
SCHEMA DeleteFile
  DELTA AppState
  path?: PATH
WHERE
  path? IN dom(file_system)
  file_system' = file_system \ {path?}
```

### 5.3. Plugin Operations

```z
SCHEMA ExecutePlugin
  XI AppState
  plugin_id?: PLUGIN_ID
  input?: File
  output!: File
WHERE
  plugin_id? IN active_plugins
  -- Plugin-specific logic would be defined here
```

### 5.4. Encryption Operations

```z
SCHEMA EncryptFile
  DELTA AppState
  path?: PATH
  key?: STRING
WHERE
  path? IN dom(file_system)
  file_system'(path?).content = encrypt(file_system(path?).content, key?)
```

```z
SCHEMA DecryptFile
  DELTA AppState
  path?: PATH
  key?: STRING
WHERE
  path? IN dom(file_system)
  file_system'(path?).content = decrypt(file_system(path?).content, key?)
```
