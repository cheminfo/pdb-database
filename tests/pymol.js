var pymol = require('../pymol');

var pdb = fs.readFileSync('./1080.pdb');

pymol('aaaa', pdb);