var config = require('./config')();
var pdbParser = require('./pdbParser');
var pymol = require('./pymol');

var zlib = require('zlib');
var fs = require('fs');

var nano = require('nano')(config.couch.fullUrl);
nano.db.create(config.database);
var db = nano.db.use(config.couch.database);
return db;

var destination = config.rsync.destination;


module.exports = {
    processNewFile: function(newFile, callback) {
        console.log("Process: "+newFile);
        fs.readFile(newFile, function(err,data) {
            if (err) console.log(err);
            zlib.gunzip(data, function(err, buffer) {
                if (err) throw err;
                var id=newFile.replace(/^.*\/pdb([^\.]*).*/,"$1").toUpperCase();
                console.log('PDB id: ', id);
                var pdbEntry = pdbParser.parse(buffer.toString());
                pdbEntry._id=id;
                pdbEntry._attachments={};
                pdbEntry._attachments[id+".pdb"]={
                    "content_type":"chemical/x-pdb",
                    "data":buffer.toString("Base64")
                };
                pymol(id, buffer.toString(), config.pymol).then(function(buff) {
                    if(!(buff instanceof Array)) {
                        buff = [buff];
                    }

                    for(var i=0; i<buff.length; i++) {
                        pdbEntry._attachments[''+ config.pymol[i].width + 'x' + config.pymol[i].height+ '.gif'] = {
                            "content_type": "image/gif",
                            "data": buff.toString("Base64")
                        };
                    }
                    saveToCouchDB(pdbEntry, callback);
                }, function(err) {
                    console.error('An error occured while generating the image with pymol', err);
                    console.log('No image could be generated for ' + id);
                    saveToCouchDB(pdbEntry, callback);
                });

            });
        })
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