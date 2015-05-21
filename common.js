'use strict';

var config = require('./config')();
var pdbParser = require('./pdbParser');
var pymol = require('./pymol');

var zlib = require('zlib');
var fs = require('fs');
var path = require('path');

var nano = require('nano')(config.couch.fullUrl);
nano.db.create(config.database);
var pdb = nano.db.use(config.couch.database);

module.exports = {
    processPdb: function(filename, callback) {
        console.log("Process: "+filename);
        var id = getIdFromFileName(filename).toUpperCase();
        fs.readFile(filename, function(err,data) {
            if (err) console.log(err);
            zlib.gunzip(data, function(err, buffer) {
                if (err) return callback(err);
                console.log('PDB id: ', id);
                var pdbEntry = pdbParser.parse(buffer.toString());
                pdbEntry._id=id;
                pdbEntry._attachments={};
                pdbEntry._attachments[id+".pdb"]={
                    "content_type":"chemical/x-pdb",
                    "data":buffer.toString("Base64")
                };
                saveToCouchDB(pdbEntry, callback);
            });
        })
    },
    
    processPdbAssembly: function(filename, callback) {
        var id = getIdFromFileName(filename).toUpperCase();
        var id_l = id.toLowerCase();
        var code = id_l.substr(1,2);

        var bioFilename = path.join(config.rsyncAssembly.destination, code, id_l+'.pdb1.gz');
        pdb.get(id, {}, function(err, pdbEntry) {
            if (err) return callback(err);
            console.log('pdb entry: ' + pdbEntry);

            function doPymol(filename) {
                fs.readFile(filename, function(err,data) {
                    if(err) return callback(err);
                    zlib.gunzip(data, function (err, buffer) {
                        if(err) return callback(err);
                        pymol(id, buffer.toString(), config.pymol).then(function (buff) {
                            if (!(buff instanceof Array)) {
                                buff = [buff];
                            }

                            for (var i = 0; i < buff.length; i++) {
                                pdbEntry._attachments['' + config.pymol[i].width + 'x' + config.pymol[i].height + '.gif'] = {
                                    "content_type": "image/gif",
                                    "data": buff[i].toString("Base64")
                                };
                            }
                            pdbEntry._attachments[id+".pdb1"]={
                                "content_type":"chemical/x-pdb",
                                "data":buffer.toString("Base64")
                            };
                            saveToCouchDB(pdbEntry, callback);
                        }, function (err) {
                            console.error('An error occured while generating the image with pymol', err);
                            console.log('No image could be generated for ' + id);
                            saveToCouchDB(pdbEntry, callback);
                        });
                    });
                });
            }
            // File does not exist
            // Generate pymol from asymmetric unit
            console.log('bio filename', bioFilename);
            if(!fs.existsSync(bioFilename)) {
                console.log('generate pymol normal', filename);
                return doPymol(filename);
            } else {
                console.log('generate pymol subunits', bioFilename);
                return doPymol(bioFilename);
            }
        });


    }
};

function saveToCouchDB(entry, callback) {
    pdb.head(entry._id, function(err, _, header) {
        // if (err) console.log(err.status_code);
        if (header && header.etag) { // a revision exists
            entry._rev=header.etag.replace(/"/g,""); // strange code ?!!!!
        }

        pdb.insert( entry, function(err, body, header) {
            if (err) throw console.log(err);
            callback(null, entry._id);
        });
    });
}

function getIdFromFileName(filename) {
    return filename.replace(/^.*\/pdb([^\.]*).*/,"$1");
}
