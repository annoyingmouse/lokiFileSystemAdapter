/**
 * https://github.com/techfort/LokiJS/issues/149
 */
function FileSystemAdapterError() {}
FileSystemAdapterError.prototype = new Error();
/**
 * this adapter assumes an object called options is passed,
 * containing the following properties:
 * base_dir: location where the file is to be saved
 */
function FileSystemAdapter(options) {
    this.options = options;
}
/**
 * Attempts to get the file, then write to it, throws errors on failure of each attempt
 * @param name
 * @param data
 * @param callback
 */
FileSystemAdapter.prototype.saveDatabase = function (name, data, callback) {
    fs.root.getFile(
        this.options.base_dir + '/' + name,
        {
            create: true
        },
        function(fileEntry) {
            fileEntry.createWriter(
                function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        if (fileWriter.length === 0) {
                            var blob = new Blob(
                                [data],
                                {
                                    type: 'text/plain'
                                }
                            );
                            fileWriter.write(blob);
                        }
                    };
                    fileWriter.truncate(0);
                },
                function(err){
                    throw new FileSystemAdapterError("Unable to write file" + JSON.stringify(err));
                }
            );
        },
        function(err){
            throw new FileSystemAdapterError("Unable to get file" + JSON.stringify(err));
        }
    );
};
/**
 * Attempts to get the file and then read from it, throws errors on failure of each attempt
 * @param name
 * @param callback
 */
FileSystemAdapter.prototype.loadDatabase = function (name, callback) {
    fs.root.getFile(
        this.options.base_dir + '/' + name,
        {
            create: false
        },
        function(fileEntry){
            fileEntry.file(function(file) {
                var reader = new FileReader();
                reader.onloadend = function(event) {
                    var contents = event.target.result;
                    callback(contents);
                };
                reader.readAsText(file);
            }, function(err){
                callback(FileSystemAdapterError("Unable to read file" + err.message));
            });
        },
        function(err){
        	callback(new FileSystemAdapterError("Unable to get file: " + err.message))
        }
    );
};
