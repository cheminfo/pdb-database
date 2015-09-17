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
                saveToCouchDB(pdbEntry, nano.db.use(config.asymetrical.couch.database)).then(function (id) {
                    return callback(null, id);
                }).catch(function (err) {
                    return callback(err);
                });
            });
        })
    },


    processPdbs: function (files) {
        return new Promise(function (resolve, reject) {
            if (files && files.length > 0) {
                async.mapSeries(files, module.exports.processPdb, function (err) {
                    if (err) return reject(err);
                    return resolve();
                });
            }
        });
    },

    processPdbAssemblies: function (files) {
        return new Promise(function (resolve, reject) {
            if (files && files.length > 0) {
                async.mapSeries(files, module.exports.processPdbAssembly, function (err) {
                    if (err) return reject(err);
                    return resolve();
                })
            }
        });
    },

    processPdbAssembly: function (filename, callback) {
        var id = module.exports.getIdFromFileName(filename).toUpperCase();
        console.log(id);
        var id_l = id.toLowerCase();
        var code = id_l.substr(1, 2);

        var bioFilename = path.join(config.bioAssembly.rsync.destination, code, id_l + '.pdb1.gz');
        var pdbEntry = {_id: id, _attachments: {}};
        // File does not exist
        console.log('generate pymol subunits', bioFilename);
        doPymol(bioFilename, pdbEntry, {
            pdb: nano.db.use(config.bioAssembly.couch.database)
        }).then(function (id) {
            return callback(null, id);
        }).catch(function (e) {
            console.error('An error occured while processing biological assembly ' + id, e);
            return callback(null);
        });
    },

    getIdFromFileName: function (filename) {
        return filename.replace(/^.*\/pdb([^\.]*)\.ent\.gz/, "$1")
            .replace(/^.*\/([^\.]*)\.pdb1.gz/, "$1");
    }

};

function saveToCouchDB(entry, pdb) {
    return new Promise(function (resolve, reject) {
        pdb.head(entry._id, function (err, _, header) {
            if (err && err.statusCode !== 404) return reject(err);
            if (!err && header && header.etag) { // a revision exists
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
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, function (err, data) {
            console.log('read file', filename);
            if (err) return reject(err);
            zlib.gunzip(data, function (err, buffer) {
                console.log('unzip file', filename);
                if (err) return reject(err);
                pymol(pdbEntry._id, buffer, config.pymol).then(function (buff) {
                    console.log('Add image(s) and pdb as inline attachment');
                    if (!(buff instanceof Array)) {
                        buff = [buff];
                    }
                    for (var i = 0; i < buff.length; i++) {
                        pdbEntry._attachments['' + config.pymol[i].width + 'x' + config.pymol[i].height + '.png'] = {
                            "content_type": "image/png",
                            "data": buff[i].toString("Base64")
                        };
                    }
                    if (buffer.length < MAX_BUFFER_LENGTH) {
                        pdbEntry._attachments[pdbEntry._id + ".pdb1"] = {
                            "content_type": "chemical/x-pdb",
                            "data": buffer.toString("Base64")
                        };
                    }
                    else {
                        console.log('Not adding ' + pdbEntry._id + '.pdb1 to database (file is too big)');
                    }
                    return saveToCouchDB(pdbEntry, options.pdb);
                }, function (err) {
                    console.error('An error occured while generating the image with pymol' + pdbEntry._id, err);
                    console.log('No image could be generated for ' + pdbEntry._id);
                    return saveToCouchDB(pdbEntry, options.pdb);
                }).then(resolve, reject);
            });
        });
    });
}
