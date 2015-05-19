/**
 * Created by Dom on 19/05/2015.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        root.FileSystemAdapter = factory();
    }
}(this, function () {
    return (function (options) {
        'use strict';

        function FileSystemAdapterError() {}

        FileSystemAdapterError.prototype = new Error();

        if (!options) {
            throw new FileSystemAdapterError('No options configured in FileSystemAdapter');
        }

        if (!options.base_dir) {
            throw new FileSystemAdapterError('No base directory specified in FileSystemAdapter');
        }

        if (!options.file_system) {
            throw new FileSystemAdapterError('No file system specified in FileSystemAdapter');
        }

        /**
         * this adapter assumes an object options is passed,
         * containing the following properties:
         * base_dir: location where the file is to be saved
         * file_system: filesystem Object
         */
        function FileSystemAdapter(options) {
            this.options = options;
            if (!this.checkAvailability()) {
                console.error('indexedDB does not seem to be supported for your environment');
            }
        }

        /**
         * Checks to see if the File System is available
         * @returns {boolean}
         */
        FileSystemAdapter.prototype.checkAvailability = function(){
            // Handle vendor prefixes.
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            // Check for support.
            if(window.requestFileSystem) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * Attempts to get the file, then write to it, throws errors on failure of each attempt
         * @param name
         * @param data
         * @param callback
         */
        FileSystemAdapter.prototype.saveDatabase = function (name, data, callback) {
            this.options.file_system.root.getFile(
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
                                        [data.serialize()],
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
            this.options.file_system.root.getFile(
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
                        throw new FileSystemAdapterError("Unable to read file" + JSON.stringify(err));
                    });
                },
                function(err){
                    throw new FileSystemAdapterError("Unable to get file" + JSON.stringify(err));
                }
            );
        };
        return FileSystemAdapter;
    });
}));
