var fs = require('fs');
var gm = require('gm');
var _ = require('lodash');


function pymol(id, pdb, options) {
    if(options instanceof Array) {
        var prom = new Array(options.length);
        for(var i=0; i<options.length; i++) {
            prom[i] = pymol(id, pdb, options[i])
        }
        return Promise.all(prom);
    }

    var defaultOptions = {
        width: 200,
        height: 200
    };

    options = _.defaults(options, defaultOptions);
    console.log('pymol ' + options.width + ' x ' + options.height);
    return new Promise(function(resolve, reject) {
        var pdbFile = __dirname + '/' + id+ options.width + 'x' + options.height + '.pdb';
        var pngFile = __dirname + '/' + id+ options.width + 'x' + options.height + '.png';
        fs.writeFile(pdbFile, pdb, function(err) {
            if(err) {
                console.error('Error writing pdb file')
                return reject('could not write file');
            }
            var exec = require('child_process').exec;
            var cmd = 'pymol -c ' + pdbFile + ' -d "as ribbon;spectrum count;set seq_view; set all_states; set opaque_background, off;" -g ' + pngFile;

            exec(cmd,
                function (error) {
                    console.log('Execute pymol command', id);
                    fs.unlinkSync(pdbFile);
                    if (error !== null) {
                        console.error('error executing pymol command', error);
                        return reject(error);
                    }

                    gm(pngFile).resize(options.width, options.height).toBuffer('png', function(err,buffer){
                        console.log('resize image');
                        fs.unlinkSync(pngFile);
                        if(err) {
                            console.error('An resizing image');
                            return reject(err);
                        }
                        return resolve(buffer);
                    });
                });
        });
    });
}

exports = module.exports = pymol;
