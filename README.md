# lokiFileSystemAdapter
An attempt to create a File System Persistence Adaptor for loki for use in Cordova AND Chrome
## Usage
Make sure you have a global variable called fs and that it points to the DOMFileSystem (or rename fs in the file)

    window.fsAdapter = new FileSystemAdapter({
        "base_dir": "BASE DIRECTORY"
    });
    window.db = new loki('loki.json', {
        adapter: fsAdapter
    });
