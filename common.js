'use strict';

var MAX_BUFFER_LENGTH = 150 * 1024 * 1024; // max buffer size 150M
var config = require('./config')();
var pdbParser = require('./pdbParser');
var pymol = require('./pymol');

var zlib = require('zlib');
var fs = require('fs');
var path = require('path');

var nano = require('nano')(config.couch.fullUrl);
nano.db.create(config.database);
var async = require('async');

module.exports = {
    processPdb: function (filename, callback) {
        console.log("Process: " + filename);
        var id = module.exports.getIdFromFileName(filename).toUpperCase();
        fs.readFile(filename, function (err, data) {
            if (err) return callback(err);
            zlib.gunzip(data, function (err, buffer) {
                if (err) return callback(err);
                var pdbEntry = pdbParser.parse(buffer.toString());
                pdbEntry._id = id;
                pdbEntry._attachments = {};
                pdbEntry._attachments[id + ".pdb"] = {
                    "content_type": "chemical/x-pdb",
                    "data": buffer.toString("Base64")
                };
                saveToCouchDB(pdbEntry, nano.db.use(config.couch.database)).then(function (id) {
                    return callback(null, id);
                }).catch(function (err) {
                    return callback(err);
                });
            });
        })
    },


    processPdbs: function(files) {
        return function () {
            return new Promise(function (resolve, reject) {
                if (files && files.length > 0) {
                    async.mapSeries(files, module.exports.processPdb, function (err) {
                        if (err) return reject(err);
                        return resolve();
                    });
                }
            });
        };
    },

    processPdbAssemblies: function(files) {
        return function () {
            return new Promise(function (resolve, reject) {
                if (files && files.length > 0) {
                    async.mapSeries(files, module.exports.processPdbAssembly, function (err) {
                        if (err) return reject(err);
                        return resolve();
                    })
                }
            });
        }
    },

    processPdbAssembly: function (filename, callback) {
        var id = module.exports.getIdFromFileName(filename).toUpperCase();
        var id_l = id.toLowerCase();
        var code = id_l.substr(1, 2);
        var pdb = nano.db.use(config.couch.bioAssemblyDatabase);

        var bioFilename = path.join(config.rsyncAssembly.destination, code, id_l + '.pdb1.gz');
        pdb.get(id, {}, function (err, pdbEntry) {
            if (err) return callback(err);
            // File does not exist
            // Generate pymol from asymmetric unit
            if (!fs.existsSync(bioFilename)) {
                console.log('generate pymol normal', filename);
                doPymol(filename, pdbEntry, {
                    save: false,
                    pdb: nano.db.use(config.couch.bioAssemblyDatabase)
                }).then(function(id) {
                    return callback(null, id);
                }).catch(function(err) {
                    return callback(err);
                });
            } else {
                console.log('generate pymol subunits', bioFilename);
                doPymol(bioFilename, pdbEntry, {
                    save: true,
                    pdb: nano.db.use(config.couch.bioAssemblyDatabase)
                }).then(function (id) {
                    return callback(null, id);
                }).catch(function () {
                    console.log('An error occured while processing biological assembly, fallback to normal pdb');
                    doPymol(filename, pdbEntry, {
                        save: false,
                        pdb: nano.db.use(config.couch.bioAssemblyDatabase)
                    }).then(function (id) {
                        return callback(null, id);
                    }).catch(function (err) {
                        return callback(err);
                    })
                });
            }
        });
    },

    getIdFromFileName: function (filename) {
        return filename.replace(/^.*\/pdb([^\.]*).*/, "$1");
    }

};

function saveToCouchDB(entry, pdb) {
    return new Promise(function (resolve, reject) {
        pdb.head(entry._id, function (err, _, header) {
            if (err) return reject(err);
            // if (err) console.log(err.status_code);
            if (header && header.etag) { // a revision exists
                entry._rev = header.etag.replace(/"/g, ""); // strange code ?!!!!
            }

            pdb.insert(entry, function (err, body, header) {
                if (err) return reject(err);
                resolve(entry._id);
            });
        });
    });

}

function doPymol(filename, pdbEntry, options) {
    options = options || {};
    return Promise.resolve().then(function() {
        var data = fs.readFileSync(filename);
        var buffer = zlib.gunzipSync(data);
        return pymol(pdbEntry._id, buffer, config.pymol).then(function (buff) {
            if (!(buff instanceof Array)) {
                buff = [buff];
            }

            for (var i = 0; i < buff.length; i++) {
                pdbEntry._attachments['' + config.pymol[i].width + 'x' + config.pymol[i].height + '.gif'] = {
                    "content_type": "image/gif",
                    "data": buff[i].toString("Base64")
                };
            }
            if (buffer.length < MAX_BUFFER_LENGTH && options.save) {
                pdbEntry._attachments[pdbEntry._id + ".pdb1"] = {
                    "content_type": "chemical/x-pdb",
                    "data": buffer.toString("Base64")
                };
            }
            else if (options.save) {
                console.log('Not adding ' + pdbEntry._id + '.pdb1 to database (file is too big)');
            }
            return saveToCouchDB(pdbEntry, options.pdb);
        }, function (err) {
            console.error('An error occured while generating the image with pymol', err);
            console.log('No image could be generated for ' + pdbEntry._id);
            return saveToCouchDB(pdbEntry, options.pdb);
        });
    });
}