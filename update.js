// require ftp
//  npm install ftp

var config = require('./config.js')();
var Rsync = require ('rsync');
var async = require ('async');
var common = require('./common');

var pdb = common.createCouchDB(config.couch);

var newFiles=[];
var rsync = new Rsync();
rsync.source(config.rsync.source);
rsync.destination(config.rsync.destination);
rsync.flags("rlptvz");
rsync.set("delete");

rsync.output(
    function(data){
        // do things like parse progress
        var line=data.toString().replace(/[\r\n].*/g,"");
        if (line.match(/ent.gz$/)) newFiles.push(config.rsync.destination + line);
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

// this file is gzip, we need to uncompress it
function processNewFiles(newFiles, callback) {
    if (newFiles && newFiles.length>0) {
        async.mapSeries(newFiles, common.processNewFile, function(err) {
            if(err) console.error(err);
            callback(null, newFiles);
        })
    }
}
