# Total Commander Android APK Analysis

This repository contains a comprehensive analysis of the **Total Commander for Android** application (version 1253), including formal specifications, technical documentation, and architectural diagrams.

## Overview

Total Commander is a powerful dual-pane file manager for Android that provides extensive file management capabilities, archive handling, a robust plugin system, and support for root operations. This analysis was conducted through reverse engineering of the APK to understand its internal architecture and design patterns.

## Repository Contents

| File | Description |
|------|-------------|
| `README.md` | This file - repository overview and summary |
| `z_plus_plus_spec.md` | Z++ formal specification of core components and operations |
| `technical_documentation.md` | Detailed technical documentation with Mermaid diagrams |
| `analysis/` | Detailed component analysis and findings |

## Key Findings

### Application Architecture

The application follows a modular architecture with clear separation of concerns:

1. **Core Application (`TcApplication`)**: Singleton managing global state, settings, and component lifecycle
2. **Main Activity (`TotalCommander`)**: Primary UI with dual-pane file browser
3. **File System Abstraction**: Unified interface for local, archive, and remote file systems
4. **Plugin System**: Extensibility mechanism for third-party integrations
5. **Root Functions**: Privileged operations module

### Native Libraries

The APK includes four native libraries (ARM64):

| Library | Size | Purpose |
|---------|------|---------|
| `libtcnative.so` | 47KB | AES encryption, password handling, UID/GID utilities |
| `libtcmadmin.so` | 68KB | Admin functions |
| `libtcmadmin21.so` | 68KB | Admin functions (Android 21+) |
| `libtcun7zip.so` | 953KB | 7-Zip archive extraction |

### Core Classes (by size)

| Class | Lines | Responsibility |
|-------|-------|----------------|
| `TotalCommander.java` | 511KB | Main activity and UI coordination |
| `TcApplication.java` | 267KB | Application singleton and global state |
| `FileWorkerThread.java` | 221KB | Background file operations |
| `Utilities.java` | 143KB | Helper functions and utilities |
| `MediaPlayerActivity.java` | 108KB | Media playback functionality |

### Plugin System

The plugin architecture is based on AIDL interfaces:

- `IPluginFunctions`: Core plugin interface for file system operations
- `IRemoteCopyCallback`: Callback for remote copy operations
- `IRemoteProgressCallback`: Progress reporting callback
- `IRemoteDialogCallback`: Dialog interaction callback
- `PluginItem`: Parcelable data structure for file items

### Encryption

The application uses AES encryption via JNI for:
- Password encryption/decryption
- File content encryption (Fcrypt)
- Buffer encryption/decryption

### Supported Features

- **Archive Formats**: ZIP, RAR, RAR5, 7z, TAR, GZ, BZ2, ARJ, LZH, ISO, IMG, CAB
- **Localization**: 35+ languages
- **Android Versions**: Supports Android 5.0 (API 21) through Android 14+
- **Root Access**: Optional root operations for privileged file management

## Documentation

### Z++ Formal Specification

The `z_plus_plus_spec.md` file contains formal specifications for:
- Application state schema
- File and plugin schemas
- Navigation operations
- File operations (copy, move, delete)
- Plugin execution
- Encryption operations

### Technical Documentation

The `technical_documentation.md` file includes:
- Architecture overview with Mermaid diagrams
- Core component descriptions
- Plugin architecture details
- File operation sequences
- Activity lifecycle diagrams

## License

This analysis is provided for educational and research purposes only. Total Commander is a product of Ghisler Software GmbH.

## References

- [Total Commander Official Website](https://www.ghisler.com/)
- [Total Commander Android](https://play.google.com/store/apps/details?id=com.ghisler.android.TotalCommander)
