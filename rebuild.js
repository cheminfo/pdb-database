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

function errorHandler(err) {
    console.log('An error occured', err, err.stack);
}

glob(destination+"**/*.gz", {}, function (er, files) {
    if(justone) {
        Promise.resolve()
            .then(processPdbs(files.slice(0,1)))
            .then(processPdbsAssembly(files.slice(0,1)))
            .catch(errorHandler);
    }
    else {
        Promise.resolve()
            .then(processPdbs(files))
            .then(processPdbsAssembly(files))
            .catch(errorHandler);
    }

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



