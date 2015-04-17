// require ftp
//  npm install ftp
// Rebuilds the database based on the rsynced directory
// Resends attachments
// Resends values computed by the parser

var config = require('./config.js')();
var pdbParser = require('./pdbParser');

var zlib = require('zlib');
var fs = require('fs');
var nano = require('nano')(config.couch.fullUrl);
var glob = require("glob");
var async = require ('async');

var destination=config.couch.destination;


glob(destination+"**/*.gz", {}, function (er, files) {
	processNewFiles(files);
});


function processNewFile(newFile, callback) {
	console.log("Process: "+newFile);
	fs.readFile(newFile, function(err,data) {
		if (err) console.log(err);
		zlib.gunzip(data, function(err, buffer) {
			if (err) throw err;
			var id=newFile.replace(/^.*\/pdb([^\.]*).*/,"$1").toUpperCase();
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
}


// this file is gzip, we need to uncompress it
function processNewFiles(newFiles) {
	if (newFiles && newFiles.length>0) {
		async.mapLimit(newFiles, 1, processNewFile, function(err,result) {
			console.log(err);
			console.log(result);
		})
	}
}


function saveToCouchDB(entry, callback) {
	nano.db.create(config.couch.database);
	var pdb = nano.db.use(config.couch.database);
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
