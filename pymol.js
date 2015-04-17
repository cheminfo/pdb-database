var fs = require('fs');
var gm = require('gm');

exports = module.exports = function(id, pdb) {
    return new Promise(function(resolve, reject) {
        var pdbFile = id+'.pdb';
        var pngFile = id+'.png';
        fs.writeFile(pdbFile, pdb, function(err) {
            if(err) {
                reject('could not write file');
            }

            var exec = require('child_process').exec,child;
            var cmd = 'pymol -c ' + pdbFile + ' -d "as ribbon;spectrum count;set seq_view" -g ' + pngFile;
            child = exec(cmd,
                    function (error, stdout, stderr) {

                        fs.unlinkSync(pdbFile);
                        console.log('stdout: ' + stdout);
                        console.log('stderr: ' + stderr);
                        if (error !== null) {
                            console.log('exec error: ' + error);
                            return reject(error);
                        }
                        gm(pngFile).resize(200,200).toBuffer('gif', function(err,buffer){
                            fs.unlinkSync(pngFile);
                            if(err) return reject(err);

                            return resolve(buffer);
                        });


                    });
        });
    });
};
