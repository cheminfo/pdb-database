var fs = require('fs');
var gm = require('gm');
var _ = require('lodash');

exports = module.exports = function(id, pdb, options) {

    var defaultOptions = {
        width: 200,
        height: 200
    };

    options = _.defaults(options, defaultOptions);
    return new Promise(function(resolve, reject) {
        var pdbFile = id+'.pdb';
        var pngFile = id+'.png';
        fs.writeFile(pdbFile, pdb, function(err) {
            if(err) {
                reject('could not write file');
            }

            var exec = require('child_process').exec;
            var cmd = 'pymol -c ' + pdbFile + ' -d "as ribbon;spectrum count;set seq_view" -g ' + pngFile;
            exec(cmd,
                function (error) {

                    fs.unlinkSync(pdbFile);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                        return reject(error);
                    }
                    gm(pngFile).resize(options.width, options.height).toBuffer('gif', function(err,buffer){
                        fs.unlinkSync(pngFile);
                        if(err) return reject(err);

                        return resolve(buffer);
                    });
                });
        });
    });
};
