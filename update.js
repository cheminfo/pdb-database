// require ftp
//  npm install ftp

var config = require('./config.js')();
var Rsync = require ('rsync');
var common = require('./common');
var fs = require('fs');
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
  prom = prom.then(doRsync(config.bioAssembly.rsync.source, config.bioAssembly.rsync.destination, common.processPdbAssemblies));
}

prom.catch(errorHandler);

function doRsync(source, destination, fn) {
  return function() {
    return new Promise(function(resolve, reject) {
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
          if(line.startsWith('deleting ')) return;
          if (line.match(/\.gz$/)){
            fs.appendFileSync('./rsyncChanges', config.asymetrical.rsync.destination + line + '\n');
            newFiles.push(config.asymetrical.rsync.destination + line);
          }
        }, function(data) {
          // do things like parse error output
        }
      );

      rsync.execute(function(error, code, cmd) {
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

