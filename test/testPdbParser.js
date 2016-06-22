var fs = require('fs');
var pdbParser = require('../pdbParser.js');

describe('Check pdb parser of 1O80', function () {
    var pdb = fs.readFileSync('./test/1O8O.pdb','utf8');
    var result=pdbParser.parse(pdb);
    console.log(result);
    
    it('Check result', function () {
        result.chain.A.nbResidues.should.equal(167);
        result.helices.length.should.equal(21);
        result.nbResidues.should.equal(501);
        result.nbChains.should.equal(3);
    });
});

describe('Check pdb parser of 3QK2', function () {
    var pdb = fs.readFileSync('./test/3QK2.pdb','utf8');
    var result=pdbParser.parse(pdb);
    console.log(result);

    it('Check result', function () {
        result.nbModifiedResidues.should.equal(1);
    });
});