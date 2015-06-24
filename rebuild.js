// Rebuilds the database based on the rsynced directory
// Resends attachments
// Resends values computed by the parser

var config = require('./config.js')();
var common = require('./common');
var glob = require("glob");
var argv = require('minimist')(process.argv.slice(2));


function errorHandler(err) {
    console.log('An error occured', err, err.stack);
}

var pattern,
    limit = argv.limit,
    file = argv.file,
    fromFile = argv.fromFile,
    toFile = argv.toFile,
    fromDir = argv.fromDir,
    toDir = argv.toDir

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

function getFiles(pattern) {
    return new Promise(function (resolve, reject) {
        glob(pattern, {}, function (err, files) {
            if (err) return reject(err);
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

            if (fromDir) {
                files = files.filter(function (f) {
                    var code = common.getIdFromFileName(f);
                    return code.substr(1, 2) >= fromDir;
                });
            }

            if (toDir) {
                files = files.filter(function (f) {
                    var code = common.getIdFromFileName(f);
                    return code.substr(1, 2) <= toDir;
                });
            }
            if (limit) {
                files = files.slice(0, limit);
            }
            return resolve(files)
        });
    });
}

function processPdbFiles(files) {
    console.log('Pdb database: about to process ' + files.length + ' files.');
    return common.processPdbs(files);
}

function processAssemblyFiles(files) {
    console.log('Pdb bio assembly database: about to process ' + files.length + ' files.');
    return common.processPdb(files);
}

function getPdbFiles() {
    return getFiles(config.rsync.destination + pattern)
}

function getAssemblyFiles() {
    return getFiles(config.rsyncAssembly.destination + pattern);
}

var prom = Promise.resolve();

if (argv.pdb) {
    prom = prom
        .then(getPdbFiles)
        .then(processPdbFiles);
}

if (argv['pdb-bio-assembly']) {
    prom = prom
        .then(getAssemblyFiles)
        .then(processAssemblyFiles);
}

prom.catch(errorHandler);


getFiles(destination + pattern)
    .then(processFiles)
    .catch(errorHandler);




