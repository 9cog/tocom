# Total Commander Android: Component Analysis

This document provides a detailed analysis of the key components identified in the Total Commander for Android APK.

## 1. Native Library Analysis

### 1.1. libtcnative.so

This library provides core native functionality through JNI:

**Exported Functions:**
```
Java_com_ghisler_android_TotalCommander_AESjniLib_DecryptBuffer
Java_com_ghisler_android_TotalCommander_AESjniLib_EncryptBuffer
Java_com_ghisler_android_TotalCommander_AESjniLib_FcryptDecrypt
Java_com_ghisler_android_TotalCommander_AESjniLib_FcryptEncrypt
Java_com_ghisler_android_TotalCommander_AESjniLib_FcryptEnd
Java_com_ghisler_android_TotalCommander_AESjniLib_FcryptInit
Java_com_ghisler_android_TotalCommander_AESjniLib_InitKeys
Java_com_ghisler_android_TotalCommander_AESjniLib_decryptPassword
Java_com_ghisler_android_TotalCommander_AESjniLib_encryptPassword
Java_com_ghisler_android_TotalCommander_AESjniLib_gidToGroupName
Java_com_ghisler_android_TotalCommander_AESjniLib_listAllGids
Java_com_ghisler_android_TotalCommander_AESjniLib_listAllUids
Java_com_ghisler_android_TotalCommander_AESjniLib_uidToUserName
```

**Dependencies:**
- liblog.so (Android logging)
- libm.so (Math library)
- libdl.so (Dynamic linking)
- libc.so (C standard library)

### 1.2. libtcun7zip.so

This library provides 7-Zip archive extraction capabilities:

**Exported Functions:**
```
Java_org_ghisler_a7zip_Un7zipjniLib_extract
Java_org_ghisler_a7zip_Un7zipjniLib_list
```

**Supported Operations:**
- Archive listing
- File extraction
- Multi-threaded decompression

## 2. Interface Analysis

### 2.1. ListLookInterface

This interface defines the contract for list-based UI components:

```java
public interface ListLookInterface {
    int mo752a();                    // Get item count
    Typeface mo753c();               // Get typeface
    void mo754d(int, int, int, long); // Update item
    boolean mo756g(...);             // Configure list adapter
    String mo758j(int);              // Get item text
    int mo759l();                    // Get list height
    boolean mo760n(...);             // Handle item click
    int mo761o();                    // Get orientation
    int mo762q();                    // Get selection mode
    void mo763r(...);                // Refresh adapter
    float mo764s();                  // Get scale factor
    void mo765u(...);                // Update adapter
    Context mo766x();                // Get context
    int mo767y();                    // Get width
}
```

### 2.2. ProgressEvent

This interface defines the contract for progress reporting:

```java
public interface ProgressEvent {
    boolean mo896b(int);             // Check if cancelled
    String mo899e(int);              // Get error message
    boolean mo900f(String, String);  // Handle file conflict
    boolean mo902h(int);             // Update progress
    boolean mo903i();                // Is operation complete
    int mo905k(...);                 // Report file progress
    void mo907m(String, String);     // Log message
    int mo908p(String, int, String); // Prompt user
    void mo909t(boolean);            // Set completion status
    void mo910v();                   // Notify completion
    String mo911w(...);              // Get user input
}
```

### 2.3. IPluginFunctions (AIDL)

The plugin interface for file system extensions:

```java
public interface IPluginFunctions {
    List mo631B(String);             // List directory
    Bitmap mo632E(String);           // Get thumbnail
    int mo633H(String, int, String); // Execute command
    int mo634I(...);                 // Copy file
    String m635J();                  // Get plugin name
    boolean mo636O(String);          // Check if directory
    boolean mo637T(String);          // Check if file exists
    IRemoteCopyCallback mo638b0(String); // Get copy callback
    void mo639c(String, boolean);    // Set option
    String mo640d(String, String);   // Get file info
    int mo641e(...);                 // Get file attributes
    void mo642f(String, int, int);   // Set file attributes
    String mo643i(String);           // Resolve path
    void mo644j(...);                // Set callbacks
    boolean mo645k(String);          // Delete file
    int mo646m();                    // Get capabilities
    int mo647q(...);                 // Read file
    int mo648u(String, String[]);    // Write file
}
```

## 3. Data Structures

### 3.1. PluginItem

Parcelable structure for file items in plugins:

| Field | Type | Description |
|-------|------|-------------|
| f256a | String | File name |
| f257b | String | File path |
| f258c | boolean | Is directory |
| f259d | long | File size |
| f260e | long | Modification time |
| f261f | int | Attributes |
| f262g | int | Permissions |
| f263h | int | Flags |

### 3.2. TwoRowText

Structure for displaying file items in the list:

| Field | Type | Description |
|-------|------|-------------|
| name | String | Display name |
| info | String | Additional info (size, date) |
| icon | Drawable | File icon |
| selected | boolean | Selection state |

## 4. Activity Analysis

### 4.1. Main Activities

| Activity | Purpose |
|----------|---------|
| TotalCommander | Main dual-pane file browser |
| TCEditActivity | Text file editor |
| TCEditActivity2 | Alternative editor implementation |
| MediaPlayerActivity | Audio/video player |
| MediaPlayerActivity2 | Alternative player implementation |
| ConfigurationActivity | Settings and preferences |
| DirBrowseActivity | Directory picker |
| HelpActivity | Help documentation viewer |

### 4.2. Dialog Activities

| Activity | Purpose |
|----------|---------|
| ButtonBarDialog | Customizable button bar |
| FileOpenDialog | File open/save dialog |
| MultiRenameDialog | Batch rename tool |
| PropertiesDialog | File properties viewer |
| AssociationActivity | File association manager |

## 5. Service Analysis

### 5.1. PicoServer

An embedded HTTP server for:
- Streaming media files
- Remote file access
- Plugin communication

**Features:**
- Lightweight implementation
- Multi-threaded request handling
- MIME type detection
- Range request support

### 5.2. MultiMediaService

Background service for:
- Media playback
- Notification controls
- Audio focus management

## 6. Security Analysis

### 6.1. Encryption

The application uses AES encryption for:
- Stored passwords
- Encrypted archives
- Secure file transfer

### 6.2. Root Access

Root operations are performed through:
- `su` command execution
- Direct process communication
- Secure shell sessions

### 6.3. Permissions

Required permissions include:
- Storage access (read/write)
- Network access
- Bluetooth (for file transfer)
- System settings (for ringtone picker)

## 7. Localization

The application supports 35+ languages through:
- Android resource system
- Asset-based string files
- Runtime language switching

**Supported Languages:**
Arabic, Belarusian, Bulgarian, Catalan, Czech, Danish, German, Greek, Spanish, Finnish, French, Croatian, Hungarian, Indonesian, Italian, Hebrew, Japanese, Korean, Lithuanian, Dutch, Polish, Portuguese (BR), Portuguese (PT), Romanian, Russian, Slovak, Slovenian, Serbian, Serbian (Cyrillic), Swedish, Thai, Turkish, Ukrainian, Vietnamese, Chinese (Simplified), Chinese (Traditional)
