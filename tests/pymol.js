var pymol = require('../pymol');
var fs = require('fs');
var pdb = fs.readFileSync('./1O8O.pdb');

pymol('aaaa', pdb).then(function(data) {
    console.log('success', data);
}, function(err) {
    console.log('error', err);
});
