// Rebuilds the database based on the rsynced directory
// Resends attachments
// Resends values computed by the parser

var config = require('./config.js')();
var common = require('./common');
var glob = require("glob");
var async = require('async');
var argv = require('minimist')(process.argv.slice(2));
var justone;
var destination = config.rsync.destination;

function errorHandler(err) {
    console.log('An error occured', err, err.stack);
}

// this file is gzip, we need to uncompress it
function processPdbs(files) {
    return function () {
        return new Promise(function (resolve, reject) {
            if (files && files.length > 0) {
                async.mapSeries(files, common.processPdb, function (err) {
                    if (err) return reject(err);
                    return resolve();
                });
            }
        });
    };
}

function processPdbsAssembly(files) {
    return function () {
        return new Promise(function (resolve, reject) {
            if (files && files.length > 0) {
                async.mapSeries(files, common.processPdbAssembly, function (err) {
                    if (err) return reject(err);
                    return resolve();
                })
            }
        });
    }
}


var pattern,
    limit = argv.limit,
    file = argv.file,
    fromFile = argv.fromFile,
    toFile = argv.toFile,
    fromDir = argv.fromDir,
    toDir = argv.toDir,
    skipPart1 = argv.skipPart1;

if (argv.file) {
    file = argv.file.toLowerCase();
}
if (isNaN(limit)) limit = undefined;

if (file) {
    pattern = '**/*' + file + '.ent.gz';
}
else {
    pattern = '**/*.gz';
}

if (skipPart1) {
    processPdbs = function () {
    };
}
glob(destination + pattern, {}, function (er, files) {
    if (fromFile) {
        files = files.filter(function (f) {
            var code = common.getIdFromFileName(f);
            return code >= fromFile;
        });
    }

    if (toFile) {
        files = files.filter(function (f) {
            var code = common.getIdFromFileName(f);
            return code <= toFile;
        });
    }

    if(fromDir) {
        files = files.filter(function (f) {
            var code = common.getIdFromFileName(f);
            return code.substr(1,2) >= fromDir;
        });
    }

    if(toDir) {
        files = files.filter(function (f) {
            var code = common.getIdFromFileName(f);
            return code.substr(1,2) <= toDir;
        });
    }
    if (limit) {
        files = files.slice(0, limit);
    }
    Promise.resolve()
        .then(processPdbs(files))
        .then(processPdbsAssembly(files))
        .catch(errorHandler);
});




