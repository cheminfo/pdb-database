// require ftp
//  npm install ftp

var config = require('./config.js')();
var Rsync = require ('rsync');
var common = require('./common');
var fs = require('fs');
var newFiles=[];
var rsync = new Rsync();
rsync.source(config.rsyncAsymUnit.source);
rsync.destination(config.rsyncAsymUnit.destination);
rsync.flags("rlptvz");
rsync.set("delete");

rsync.output(
    function(data){
        // do things like parse progress
        var line=data.toString().replace(/[\r\n].*/g,"");
        if (line.match(/ent.gz$/)){
	  fs.appendFileSync('./rsyncChanges', line);
          newFiles.push(config.rsyncAsymUnit.destination + line);
        }
    }, function(data) {
        // do things like parse error output
    }
);

rsync.execute(function(error, code, cmd) {
    console.log('rysinc executed, now building database');
    if (error) {
        console.log("RSYNC ERROR");
        console.log(error);
        console.log(code);
        console.log(cmd);
    }
    Promise.resolve()
        .then(common.processPdbs(newFiles))
        .then(common.processPdbAssemblies(newFiles))
        .catch(errorHandler);
});


function errorHandler(err) {
    console.log('An error occured', err, err.stack);
}

