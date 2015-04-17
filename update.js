// require ftp
//  npm install ftp

var config = require('./config.js')();
var pdbParser = require('./pdbParser');

var Rsync = require ('rsync');
var zlib = require('zlib');
var fs = require('fs');


var nano = require('nano')(config.couch.fullUrl);
var asyncRsync = require ('async');
var async = require ('async');


var destination = config.rsync.destination;


var folders=[''];
/*
for (var i=0; i<9; i++) {
	for (var j=0; j<9; j++) {
		folders.push((i+"")+(j+""));
	}
}*/



function processFolder(folder, callback) {
	var newFiles=[];
	var rsync = new Rsync();
	rsync.source(config.rsync.source + folder);
	rsync.destination(destination);
	rsync.flags("rlptvz");
	rsync.set("delete");

	rsync.output(
	    function(data){
    		// do things like parse progress
    		var line=data.toString().replace(/[\r\n].*/g,"");
    		if (line.match(/ent.gz$/)) newFiles.push(line);
	    }, function(data) {
       	 // do things like parse error output
	    }
	);

	rsync.execute(function(error, code, cmd) {
		if (error) {
			console.log("RSYNC ERROR");
			console.log(error);
			console.log(code);
			console.log(cmd);
			processNewFiles(newFiles, callback);
		} else {
			processNewFiles(newFiles, callback);
		}
	});
}

asyncRsync.mapLimit(folders, 1, processFolder, function(err,result) {
		console.log(err);
		console.log(result);
});

function processNewFile(newFile, callback) {
	console.log("Process: "+destination+newFile);
	fs.readFile(destination+newFile, function(err,data) {
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
function processNewFiles(newFiles, callback) {
	if (newFiles && newFiles.length>0) {
		async.mapLimit(newFiles, 1, processNewFile, function(err,result) {
			console.log(err);
			console.log(result);
			
			callback(null, newFiles);
		})
	}
}


function saveToCouchDB(entry, callback) {
	nano.db.create('pdb');
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
