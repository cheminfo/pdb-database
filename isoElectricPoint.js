var CI=CI || {};
CI.protein=CI.protein || {};
CI.protein.iep=(function() {
  
  // pkN : pKa of the N-terminal amino acid (NH3+)
  // pkC : pKa of the C-terminal amino acid (COOH)
  // pkSC+ : pKa of the side chain positively charged
  // pkSC : pKa of the neutral side chain
  
  // source : http://upload.wikimedia.org/wikipedia/commons/a/a9/Amino_Acids.svg

 
  var pKaAA={
    "ALA":{"pkN": 9.71,"pkC": 2.33},
    "ARG":{"pkN": 9.00,"pkC": 2.03, "pkSCb": 12.10},
    "ASN":{"pkN": 8.76,"pkC": 2.16},
    "ASP":{"pkN": 9.66,"pkC": 1.95, "pkSC": 3.71},
    "CYS":{"pkN": 10.28,"pkC": 1.91, "pkSC": 8.14},
    "GLU":{"pkN": 9.58,"pkC": 2.16, "pkSC": 4.15},
    "GLN":{"pkN": 9.00,"pkC": 2.18},
    "GLY":{"pkN": 9.58,"pkC": 2.34},
    "HIS":{"pkN": 9.09,"pkC": 1.70, "pkSCb": 6.04},
    "ILE":{"pkN": 9.60,"pkC": 2.26},
    "LEU":{"pkN": 9.58,"pkC": 2.32},
    "LYS":{"pkN": 9.16,"pkC": 2.15, "pkSCb": 10.67},
    "MET":{"pkN": 9.08,"pkC": 2.16},
    "PHE":{"pkN": 9.09,"pkC": 2.18},
    "PRO":{"pkN": 10.47,"pkC": 1.95},
    "SER":{"pkN": 9.05,"pkC": 2.13},
    "THR":{"pkN": 8.96,"pkC": 2.20},
    "TRP":{"pkN": 9.34,"pkC": 2.38},
    "TYR":{"pkN": 9.04,"pkC": 2.24, "pkSC": 10.10},
    "VAL":{"pkN": 9.52,"pkC": 2.27}
  }

  // inspired by: http://isoelectric.ovh.org/files/practise-isoelectric-point.html#mozTocId763352

  function calculateChart(aas) {
    var combined=simplify(aas);
    if (!combined) return;
    var y=[];
    var yAbs=[];
    for (var i=0; i<=14; i=i+0.01) {
      var charge=calculateForPh(combined, i);
      y.push(charge);
      yAbs.push(Math.abs(charge));
    }
    combined.y=y;
    combined.yAbs=yAbs;

    return combined;  
  }
  
   function calculateCharge(aas, pH) {
     if (! pH) pH=7.0;
     var combined=simplify(aas);
     if (!combined) return;
     var charge=calculateForPh(combined, pH);
     return Math.round(charge*1000)/1000;  
  }
  
  function calculateIEP(aas) {
    var combined=simplify(aas);
    if (!combined) return;
    var first=0;
    var last=14;
    var current=14;
    var previous=0;
    var chargeFirst=calculateForPh(combined, first);
    var chargeLast=calculateForPh(combined, last);
    var currentCharge;
    
    while (Math.abs(current-previous)>0.0001) {
      previous=current;
      current=(last + first) / 2;
      currentCharge=calculateForPh(combined, current);
      if (currentCharge>0) {
        first=current;
      } else if (currentCharge<0) {
        last=current;
      } else {
        previous=current;
      }
    }
    return Math.round(current*1000)/1000;
  }
  
  
  function calculateForPh(combined, pH) {
    var total=0;
    total+=1/(1+Math.pow(10,pH-combined.first));
    total+=-1/(1+Math.pow(10,combined.last-pH));
    for (var key in combined.acid) {
      total+=-combined.acid[key]/(1+Math.pow(10,pKaAA[key].pkSC-pH));
    }
    for (var key in combined.basic) {
      total+=combined.basic[key]/(1+Math.pow(10,pH-pKaAA[key].pkSCb));
    }
    return total;
  }
  
  function simplify(aas) {
    var combined={};
    if (pKaAA[aas[0]]) {
      combined.first=pKaAA[aas[0]].pkN;   
    } else {
      return;
    }
     if (pKaAA[aas[aas.length-1]]) {
      combined.last=pKaAA[aas[aas.length-1]].pkC;   
    } else {
      return;
    }
    combined.basic={};
    combined.acid={};
    for (var i=0; i<aas.length; i++) {
      var aa=aas[i];
      if (! pKaAA[aa]) return;
      if (pKaAA[aa].pkSCb) {
        if (! combined.basic[aa]) {
          combined.basic[aa]=0;
        }
        combined.basic[aa]++;
      }
    }
    
    for (var i=0; i<aas.length; i++) {
      var aa=aas[i];
      if (! pKaAA[aa]) return;
      if (pKaAA[aa].pkSC) {
        if (! combined.acid[aa]) {
          combined.acid[aa]=0;
        }
        combined.acid[aa]++;
      }
    }
    
    return combined;
    
  }
  

  return {
    getCharge:calculateCharge,
    getIEP: calculateIEP,
    getChart: calculateChart
  }

})();


module.exports=CI.protein.iep;

