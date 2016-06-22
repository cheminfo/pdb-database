
describe.skip('Check pymol generation', function () {
    var pymol = require('../pymol');
    var fs = require('fs');
    var pdb = fs.readFileSync('test/1O8O.pdb');

    it('should work', function () {
        pymol('aaaa', pdb).then(function(data) {
            console.log('success', data);
        }, function(err) {
            console.log('error', err);
        });

    });
});

