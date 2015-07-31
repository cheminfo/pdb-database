// require ftp
//  npm install ftp

var config = require('./config.js')();
var Rsync = require ('rsync');
var common = require('./common');
var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

var help = [
  'pdb-asym-unit', 'do process the pdb asymetrical unit database',
  'pdb-bio-assembly', 'do process the pdb biological assembly database',
  'help', 'Display this help'
];

if(!argv['pdb-asym-unit'] && !argv['pdb-bio-assembly']) {
  argv['pdb-asym-unit'] = argv['pdb-bio-assembly'] = true;
}
var prom = Promise.resolve();
if(argv['pdb-asym-unit']) {
  console.log('Updating asymmetrical units...');
  prom = prom.then(doRsync(config.asymetrical.rsync.source, config.asymetrical.rsync.destination, common.processPdbs));
}

if(argv['pdb-bio-assembly']) {
  console.log('Updating biological assemblies...');
  prom = prom.then(doRsync(config.bioAssembly.rsync.source, config.bioAssembly.rsync.destination, common.processPdbAssemblies, function(changed) {
    console.log('Writing rsync change');
    var dir = config.bioAssembly.rsync.historyDir;
    if(!dir) return;
    dir = path.join(dir, '' + Date.now() + '.json');
    fs.writeFileSync(dir, JSON.stringify(changed));
  }));
}

prom.catch(errorHandler);

function doRsync(source, destination, fn, changedCallback) {
  return function() {
    return new Promise(function(resolve, reject) {
      var changed = {
        deleted: [],
        updated: []
      };

      var newFiles=[];
      var rsync = new Rsync();
      rsync.source(source);
      rsync.destination(destination);
      rsync.flags("rlptvz");
      rsync.set("delete");

      rsync.output(
        function(data){
          // do things like parse progress
          var line=data.toString().replace(/[\r\n].*/g,"");
          if(line.startsWith('deleting ')) {
            changed.deleted.push(common.getIdFromFileName(line).toUpperCase());
            return;
          }
          if (line.match(/\.gz$/)) {
            fs.appendFileSync('./rsyncChanges', config.asymetrical.rsync.destination + line + '\n');
            changed.updated.push(common.getIdFromFileName(line).toUpperCase());
            newFiles.push(config.asymetrical.rsync.destination + line);
          }
        }, function(data) {
          // do things like parse error output
        }
      );

      rsync.execute(function(error, code, cmd) {
        if(changedCallback) {
          changedCallback(changed);
        }
        console.log('rysnc executed, now building database');
        if (error) {
          console.log("RSYNC ERROR, did not build database");
          console.log(error);
          console.log(code);
          console.log(cmd);
          return reject(error);
        }
        return fn(newFiles).then(resolve, reject);
      });
    });
  }
}

function errorHandler(err) {
    console.log('An error occured', err, err.stack);
}

