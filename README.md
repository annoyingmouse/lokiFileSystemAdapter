# lokiFileSystemAdapter
An attempt to create a File System Persistence Adaptor for loki for use in Cordova AND Chrome
## Usage
    window.fsAdapter = new FileSystemAdapter({
        "base_dir": "BASE DIRECTORY",
        "file_system": FILE_SYSTEM_OBJECT
    });
    window.db = new loki('loki.json', {
        adapter: fsAdapter
    });
