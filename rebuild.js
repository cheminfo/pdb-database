// require ftp
//  npm install ftp
// Rebuilds the database based on the rsynced directory
// Resends attachments
// Resends values computed by the parser

var config = require('./config.js')();
var common = require('./common');
var glob = require("glob");
var async = require ('async');
var argv = require('minimist')(process.argv.slice(2));
var justone;
var destination=config.rsync.destination;

if(argv['justone']) {
    justone = true;
}

glob(destination+"**/*.gz", {}, function (er, files) {
    if(justone) {
        processNewFiles(files.slice(0,1));
    }
    else {
        processNewFiles(files);
    }

});



// this file is gzip, we need to uncompress it
function processNewFiles(newFiles) {
    if (newFiles && newFiles.length>0) {
        async.mapSeries(newFiles, common.processNewFile, function(err) {
            if(err) console.log('An error occured while processing files', err);
        });
    }
}



