# Total Commander Android: Architecture Diagrams

This document contains detailed Mermaid diagrams illustrating the architecture of Total Commander for Android.

## 1. System Context Diagram

```mermaid
C4Context
    title System Context Diagram - Total Commander Android

    Person(user, "User", "Android device user")
    System(tc, "Total Commander", "File management application")
    System_Ext(fs, "File System", "Local storage, SD cards, USB")
    System_Ext(plugins, "Plugins", "Third-party extensions")
    System_Ext(cloud, "Cloud Services", "Dropbox, Google Drive, etc.")
    System_Ext(network, "Network", "FTP, SFTP, SMB servers")

    Rel(user, tc, "Uses")
    Rel(tc, fs, "Reads/Writes")
    Rel(tc, plugins, "Loads/Communicates")
    Rel(plugins, cloud, "Accesses")
    Rel(plugins, network, "Connects")
```

## 2. Component Diagram

```mermaid
graph TB
    subgraph "Total Commander Application"
        subgraph "Presentation Layer"
            TC[TotalCommander Activity]
            ED[TCEditActivity]
            MP[MediaPlayerActivity]
            CF[ConfigurationActivity]
        end
        
        subgraph "Business Logic Layer"
            APP[TcApplication]
            FWT[FileWorkerThread]
            SF[SearchFiles]
            RF[RootFunctions]
        end
        
        subgraph "Data Access Layer"
            FSP[FileSystemPlugin]
            RAP[RemoteAppPlugin]
            IAP[InstalledAppsPlugin]
            ZIP[TcZipFile]
        end
        
        subgraph "Native Layer"
            AES[libtcnative.so]
            Z7[libtcun7zip.so]
            ADM[libtcmadmin.so]
        end
    end
    
    TC --> APP
    TC --> FWT
    ED --> APP
    MP --> APP
    CF --> APP
    
    APP --> FSP
    APP --> RAP
    APP --> IAP
    FWT --> ZIP
    FWT --> RF
    
    FSP --> AES
    ZIP --> Z7
    RF --> ADM
```

## 3. Class Diagram - Core Classes

```mermaid
classDiagram
    class TcApplication {
        -static TcApplication instance
        +FileIconCache iconCache
        +EqualizerFunctions equalizer
        +PicoServer httpServer
        +onCreate()
        +getSettings()
        +loadPlugins()
    }
    
    class TotalCommander {
        -TcApplication app
        -FileWorkerThread[] workers
        -RootFunctions root
        -SearchFiles search
        +onCreate()
        +onResume()
        +navigateTo(path)
        +copyFiles()
        +moveFiles()
        +deleteFiles()
    }
    
    class FileWorkerThread {
        -TcApplication app
        -ProgressEvent progress
        -int operation
        +run()
        +copyFile()
        +moveFile()
        +deleteFile()
        +packFiles()
        +unpackFiles()
    }
    
    class RootFunctions {
        -Process[] processes
        -DataOutputStream[] outputs
        -DataInputStream[] inputs
        +executeCommand(cmd)
        +listDirectory(path)
        +copyWithRoot()
        +deleteWithRoot()
    }
    
    class PluginObject {
        <<abstract>>
        #TcApplication app
        #String pluginId
        #String pluginName
        +listDirectory(path)*
        +openFile(path)*
        +copyFile(src, dst)*
        +deleteFile(path)*
    }
    
    class FileSystemPlugin {
        -IPluginFunctions functions
        -ServiceConnection connection
        +connect()
        +disconnect()
        +listDirectory(path)
    }
    
    class RemoteAppPlugin {
        -IPluginFunctions functions
        -Bitmap icon
        +connect()
        +listDirectory(path)
        +openFile(path)
    }
    
    TcApplication --> TotalCommander : creates
    TotalCommander --> FileWorkerThread : uses
    TotalCommander --> RootFunctions : uses
    TcApplication --> PluginObject : manages
    PluginObject <|-- FileSystemPlugin
    PluginObject <|-- RemoteAppPlugin
```

## 4. Sequence Diagram - File Copy Operation

```mermaid
sequenceDiagram
    participant User
    participant TC as TotalCommander
    participant FWT as FileWorkerThread
    participant FS as FileSystem
    participant Progress as ProgressEvent
    
    User->>TC: Select files and destination
    User->>TC: Initiate copy
    TC->>FWT: Create worker thread
    TC->>FWT: Start operation
    
    loop For each file
        FWT->>FS: Open source file
        FS-->>FWT: InputStream
        FWT->>FS: Create destination file
        FS-->>FWT: OutputStream
        
        loop While data available
            FWT->>FS: Read chunk
            FWT->>FS: Write chunk
            FWT->>Progress: Update progress
            Progress-->>TC: Refresh UI
        end
        
        FWT->>FS: Close streams
    end
    
    FWT->>Progress: Operation complete
    Progress-->>TC: Show completion
    TC-->>User: Display result
```

## 5. Sequence Diagram - Plugin Loading

```mermaid
sequenceDiagram
    participant TC as TcApplication
    participant PM as PackageManager
    participant Plugin as PluginObject
    participant Service as PluginService
    
    TC->>PM: Query installed packages
    PM-->>TC: List of packages
    
    loop For each plugin package
        TC->>TC: Check plugin signature
        TC->>Plugin: Create plugin instance
        Plugin->>Service: Bind to service
        Service-->>Plugin: Service connection
        Plugin->>Service: Get capabilities
        Service-->>Plugin: Capability flags
        TC->>TC: Register plugin
    end
    
    TC->>TC: Update plugin list
```

## 6. State Diagram - File Operation States

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Preparing: Start operation
    Preparing --> Copying: Files ready
    Preparing --> Error: Preparation failed
    
    Copying --> Copying: Next file
    Copying --> Paused: User pause
    Copying --> Cancelled: User cancel
    Copying --> Completed: All files done
    Copying --> Error: Operation failed
    
    Paused --> Copying: User resume
    Paused --> Cancelled: User cancel
    
    Error --> Idle: User acknowledge
    Cancelled --> Idle: Cleanup done
    Completed --> Idle: User acknowledge
```

## 7. Data Flow Diagram

```mermaid
flowchart LR
    subgraph Input
        UI[User Interface]
        FS[File System]
        NET[Network]
    end
    
    subgraph Processing
        TC[TotalCommander]
        FWT[FileWorkerThread]
        ZIP[Archive Handler]
        ENC[Encryption]
    end
    
    subgraph Output
        DST[Destination]
        LOG[Log Files]
        NOTIFY[Notifications]
    end
    
    UI -->|Commands| TC
    FS -->|File Data| TC
    NET -->|Remote Data| TC
    
    TC -->|Operations| FWT
    FWT -->|Archive Ops| ZIP
    FWT -->|Encrypt/Decrypt| ENC
    
    FWT -->|Write| DST
    TC -->|Status| LOG
    TC -->|Progress| NOTIFY
```

## 8. Package Diagram

```mermaid
graph TB
    subgraph "com.ghisler.android.TotalCommander"
        MAIN[Main Package]
        MAIN --> UI[UI Components]
        MAIN --> CORE[Core Logic]
        MAIN --> FILE[File Operations]
        MAIN --> PLUGIN[Plugin System]
        MAIN --> MEDIA[Media Player]
        MAIN --> ROOT[Root Functions]
    end
    
    subgraph "com.android.tcplugins.FileSystem"
        AIDL[AIDL Interfaces]
        AIDL --> IPlugin[IPluginFunctions]
        AIDL --> ICallback[Callbacks]
        AIDL --> PItem[PluginItem]
    end
    
    subgraph "org.ghisler.a7zip"
        SEVENZIP[7-Zip JNI]
    end
    
    subgraph "androidx"
        COMPAT[Compatibility Libraries]
    end
    
    PLUGIN --> AIDL
    FILE --> SEVENZIP
    UI --> COMPAT
```

## 9. Deployment Diagram

```mermaid
graph TB
    subgraph "Android Device"
        subgraph "Application Sandbox"
            APK[Total Commander APK]
            DATA[App Data Directory]
            CACHE[Cache Directory]
        end
        
        subgraph "Native Libraries"
            LIB1[libtcnative.so]
            LIB2[libtcun7zip.so]
            LIB3[libtcmadmin.so]
        end
        
        subgraph "External Storage"
            SDCARD[SD Card]
            USB[USB Storage]
        end
        
        subgraph "System"
            ROOT[Root Shell]
            MEDIA[Media Scanner]
        end
    end
    
    APK --> LIB1
    APK --> LIB2
    APK --> LIB3
    APK --> DATA
    APK --> CACHE
    APK --> SDCARD
    APK --> USB
    APK -.-> ROOT
    APK --> MEDIA
```

## 10. Entity Relationship Diagram

```mermaid
erDiagram
    FILE {
        string path PK
        string name
        long size
        long modified
        boolean isDirectory
        int permissions
    }
    
    BOOKMARK {
        int id PK
        string name
        string path
        int order
    }
    
    PLUGIN {
        string id PK
        string name
        string package
        int capabilities
        boolean enabled
    }
    
    HISTORY {
        int id PK
        string path
        long timestamp
        string panel
    }
    
    SETTINGS {
        string key PK
        string value
        string type
    }
    
    FILE ||--o{ BOOKMARK : "bookmarked as"
    FILE ||--o{ HISTORY : "visited"
    PLUGIN ||--o{ FILE : "provides access to"
```
