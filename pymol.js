var fs = require('fs');
var gm = require('gm');

exports = module.exports = function(id, pdb) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(id+'.pdb', pdb, function(err) {
	    if(err) {
            	reject('could not write file');
            }

       	    var exec = require('child_process').exec,child;
	    var cmd = 'pymol -c ' + id + '.pdb -d "as ribbon;spectrum count;set seq_view" -g ' + id + '.png';
        child = exec(cmd,
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
		    return reject(error);
                }
		gm('./' + id + '.png').write('./' + id + '.gif', function(err) {if(err) return reject(err); return resolve()});
            });
    	});
    });
};
