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

function errorHandler(err) {
    console.log('An error occured', err, err.stack);
}


if(argv['file']) {
    var file = argv['file'].toLowerCase();
}

var pattern;
if(file) {
    pattern = '**/*' + file + '.ent.gz';
}
else {
    pattern = '**/*.gz';
}
glob(destination + pattern, {}, function (er, files) {
    Promise.resolve()
        .then(processPdbs(files))
        .then(processPdbsAssembly(files))
        .catch(errorHandler);

});



// this file is gzip, we need to uncompress it
function processPdbs(files) {
    return function() {
        return new Promise(function (resolve, reject) {
            if (files && files.length>0) {
                async.mapSeries(files, common.processPdb, function(err) {
                    if(err) return reject(err);
                    return resolve();
                });
            }
        });  
    };
}

function processPdbsAssembly(files) {
    return function() {
        return new Promise(function (resolve, reject) {
            if(files && files.length > 0) {
                async.mapSeries(files, common.processPdbAssembly, function(err) {
                    if(err) return reject(err);
                    return resolve();
                })
            }
        });
    }
}



