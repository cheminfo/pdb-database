var fs = require('fs');

exports = module.exports = function(id, pdb) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(id+'.pdb', pdb, function(err) {
            reject('could not write file');
        });
        var exec = require('child_process').exec,
            child;
	var cmd = 'pymol -c ' + id + '.pdb -d "as ribbon;spectrum count;set seq_view" -g ' + id + '.png';
	console.log(cmd);
        child = exec(cmd,
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
    });
};
