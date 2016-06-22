var IEP=require('./isoElectricPoint');


var lines;

var result;
var hetnames;
var compounds;
var compoundsArray;
var helices;
var sheets;

var stopWords={"a":true,"about":true,"above":true,"across":true,"after":true,"afterwards":true,"again":true,"against":true,"all":true,"almost":true,"alone":true,"along":true,"already":true,"also":true,"although":true,"always":true,"am":true,"among":true,"amongst":true,"amoungst":true,"amount":true,"an":true,"and":true,"another":true,"any":true,"anyhow":true,"anyone":true,"anything":true,"anyway":true,"anywhere":true,"are":true,"around":true,"as":true,"at":true,"back":true,"be":true,"became":true,"because":true,"become":true,"becomes":true,"becoming":true,"been":true,"before":true,"beforehand":true,"behind":true,"being":true,"below":true,"beside":true,"besides":true,"between":true,"beyond":true,"bill":true,"both":true,"bottom":true,"but":true,"by":true,"call":true,"can":true,"cannot":true,"cant":true,"co":true,"computer":true,"con":true,"could":true,"couldnt":true,"cry":true,"de":true,"describe":true,"detail":true,"do":true,"done":true,"down":true,"due":true,"during":true,"each":true,"eg":true,"eight":true,"either":true,"eleven":true,"else":true,"elsewhere":true,"empty":true,"enough":true,"etc":true,"even":true,"ever":true,"every":true,"everyone":true,"everything":true,"everywhere":true,"except":true,"few":true,"fifteen":true,"fify":true,"fill":true,"find":true,"fire":true,"first":true,"five":true,"for":true,"former":true,"formerly":true,"forty":true,"found":true,"four":true,"from":true,"front":true,"full":true,"further":true,"get":true,"give":true,"go":true,"had":true,"has":true,"hasnt":true,"have":true,"he":true,"hence":true,"her":true,"here":true,"hereafter":true,"hereby":true,"herein":true,"hereupon":true,"hers":true,"him":true,"his":true,"how":true,"however":true,"hundred":true,"i":true,"ie":true,"if":true,"in":true,"inc":true,"indeed":true,"interest":true,"into":true,"is":true,"it":true,"its":true,"keep":true,"last":true,"latter":true,"latterly":true,"least":true,"less":true,"ltd":true,"made":true,"many":true,"may":true,"me":true,"meanwhile":true,"might":true,"mill":true,"mine":true,"more":true,"moreover":true,"most":true,"mostly":true,"move":true,"much":true,"must":true,"my":true,"name":true,"namely":true,"neither":true,"never":true,"nevertheless":true,"next":true,"nine":true,"no":true,"nobody":true,"none":true,"noone":true,"nor":true,"not":true,"nothing":true,"now":true,"nowhere":true,"of":true,"off":true,"often":true,"on":true,"once":true,"one":true,"only":true,"onto":true,"or":true,"other":true,"others":true,"otherwise":true,"our":true,"ours":true,"ourselves":true,"out":true,"over":true,"own":true,"part":true,"per":true,"perhaps":true,"please":true,"put":true,"rather":true,"re":true,"same":true,"see":true,"seem":true,"seemed":true,"seeming":true,"seems":true,"serious":true,"several":true,"she":true,"should":true,"show":true,"side":true,"since":true,"sincere":true,"six":true,"sixty":true,"so":true,"some":true,"somehow":true,"someone":true,"something":true,"sometime":true,"sometimes":true,"somewhere":true,"still":true,"such":true,"system":true,"take":true,"ten":true,"than":true,"that":true,"the":true,"their":true,"them":true,"themselves":true,"then":true,"thence":true,"there":true,"thereafter":true,"thereby":true,"therefore":true,"therein":true,"thereupon":true,"these":true,"they":true,"thick":true,"thin":true,"third":true,"this":true,"those":true,"though":true,"three":true,"through":true,"throughout":true,"thru":true,"thus":true,"to":true,"together":true,"too":true,"top":true,"toward":true,"towards":true,"twelve":true,"twenty":true,"two":true,"un":true,"under":true,"until":true,"up":true,"upon":true,"us":true,"very":true,"via":true,"was":true,"we":true,"well":true,"were":true,"what":true,"whatever":true,"when":true,"whence":true,"whenever":true,"where":true,"whereafter":true,"whereas":true,"whereby":true,"wherein":true,"whereupon":true,"wherever":true,"whether":true,"which":true,"while":true,"whither":true,"who":true,"whoever":true,"whole":true,"whom":true,"whose":true,"why":true,"will":true,"with":true,"within":true,"without":true,"would":true,"yet":true,"you":true,"your":true,"yours":true,"yourself":true,"yourselves":true};
var aa={"ALA":true,"ARG":true,"ASN":true,"ASP":true,"CYS":true,"GLU":true,"GLN":true,"GLY":true,"HIS":true,"ILE":true,"LEU":true,"LYS":true,"MET":true,"PHE":true,"PRO":true,"SER":true,"THR":true,"TRP":true,"TYR":true,"VAL":true};
var atomMass={"np":237.0482,"no":259,"gd":157.25212,"ge":72.61276,"ga":69.72307,"fm":257,"fr":223,"xe":131.29248,"os":190.22486,"hf":178.48497,"hg":200.59915,"he":4.0026,"pd":106.41533,"pa":231.03588,"pb":207.21689,"pm":145,"po":209,"dy":162.49703,"lr":260,"lu":174.96672,"md":258,"mg":24.30505,"mn":54.93805,"f":18.9984,"eu":151.96437,"mo":95.93129,"b":10.81103,"c":12.01074,"n":14.00674,"o":15.9994,"k":39.0983,"fe":55.84515,"h":1.00794,"i":126.90447,"w":183.84178,"v":50.94147,"u":238.02891,"na":22.98977,"nb":92.90638,"s":32.06608,"nd":144.23613,"ne":20.18005,"p":30.97376,"ni":58.69336,"es":252,"er":167.2563,"y":88.90585,"tm":168.93421,"tl":204.38332,"ca":40.07802,"te":127.60313,"br":79.90353,"ti":47.86675,"th":232.03805,"tb":158.92534,"bk":247,"tc":98,"ta":180.94788,"bi":208.98038,"be":9.01218,"sn":118.71011,"sm":150.36634,"sr":87.61665,"sc":44.95591,"kr":83.79933,"se":78.95939,"cu":63.54564,"cs":132.90545,"si":28.08541,"li":6.94004,"cr":51.99614,"co":58.9332,"cm":247,"cl":35.45254,"sb":121.75979,"la":138.90545,"ru":101.06495,"ce":140.11572,"cf":251,"cd":112.41155,"rn":222,"rh":102.9055,"re":186.20671,"ho":164.93032,"rb":85.46766,"ra":226.0254,"zr":91.22365,"zn":65.39557,"ir":192.21605,"ba":137.32689,"yb":173.03769,"at":210,"as":74.9216,"ar":39.94768,"in":114.81809,"au":196.96655,"al":26.98154,"am":243,"pt":195.07779,"ac":227.0278,"pu":244,"ag":107.86815,"pr":140.90765};

function parse(pdb) {
  hetnames={};
  compounds={};
  helices=[];
  sheets=[];
  compoundsArray=[];
  lines=pdb.split(/[\r\n]/);
  result={
    chain:{},
    title:"",
    formula: [],
    helices: helices,
    sheets: sheets,
    nbModifiedResidues: 0
  }
  
  for (var i=0; i<lines.length; i++) {
    var line=lines[i];
    var field=line.substr(0,6);
    if (field=="SEQRES") {
      addSeqres(line);
    } else if (field=="TITLE ") {
      title(line);
    } else if (field=="EXPDTA") {
      result.experiment=line.trim().replace(/EXPDTA *(.*)/,"$1");
    } else if (field=="HEADER") {
      result.year=line.substring(57,59)*1;
      if (result.year<50) result.year+=2000; else result.year+=1900;
    } else if (field=="FORMUL") {
      addFormula(line);
    } else if (field=="HETNAM") {
      addHetnam(line);
    } else if (field=="COMPND") {
      addCompound(line);
    } else if (field=="HELIX ") {
      addHelix(line);
    } else if (field=="SHEET ") {
      addSheet(line);
    } else if (field=="MODRES") {
      addModres(line);
    }
  }

  addStats();
  
  return result;
}

function addModres(line) {
  result.nbModifiedResidues++;
}

function addHelix(line) {
  var chain=line.substr(19,1).trim();
  var first=line.substr(21,4)*1;
  var last=line.substr(33,4)*1;
  var kind=line.substr(38,2)*1;
  helices.push({
    chain: chain,
    from: first,
    to: last,
    kind: kind
  });
}

function addSheet(line) {
  var chain=line.substr(21,1).trim();
  var first=line.substr(22,4)*1;
  var last=line.substr(33,4)*1;
 // var sense=line.substr(38,2)*1;
  sheets.push({
    chain: chain,
    from: first,
    to: last
  });
}

function calculateFormula(label, mf) {
  var parts=mf.split(" ");
  var mw=0;
  var mf="";
  for (var i=0; i<parts.length; i++) {
    var part=parts[i];
    var atom=part.replace(/[0-9]+/,"");
    var number=part.replace(/[^0-9]*/,"")*1;
    if (atomMass[atom.toLowerCase()]) {
      mw+=atomMass[atom.toLowerCase()]*number;
    }
    mf+=atom.substring(0,1);
    mf+=atom.substring(1).toLowerCase();
    if (number>1) {
      mf+=number
    }
  }
  var toReturn={label: label, mf: mf, mw: mw.toFixed(3)};
  
  if (hetnames[label]) {
    toReturn.name=hetnames[label];
  }
  return toReturn;
}


function addFormula(line) {
  var label=line.substring(12,15).trim();
  var mf=line.substring(19,70).trim();
  var number=1;
  if (mf.indexOf("(")>-1) {
    number=mf.replace(/\(.*/,"")*1; 
  }
  mf=mf.replace(/.*\(/,"").replace(/\).*/,"");
  var formula=calculateFormula(label, mf);
  formula.number=number;
  result.formula.push(formula);
}



function addKeywords(title) {
  var keywords=[];
  var parts=title.toLowerCase().split(/ +/);
  for (var i=0; i<parts.length; i++) {
    if (! stopWords[parts[i]]) {
      keywords.push(parts[i]);
    }
  }
  return keywords;
}

function title(line) {
  if (result.title) {
    result.title+=" ";
  }
  result.title+=line.substring(10).trim();  
}

function addSeqres(line) {
  if (Object.keys(compounds).length === 0) {
    analyseCompounds();
  }
  var sequence=line.substring(6,10)*1;
  var chain=line.substring(10,12).trim();
  var nbResidues=line.substring(14,18)*1;
  var residues=line.substring(19,70).trim().split(/ +/);

  if (! result.chain[chain]) {
    result.chain[chain]=compounds[chain];
    if (!result.chain[chain]) {
      result.chain[chain]={};
    }
    result.chain[chain].nbResidues=nbResidues;
    result.chain[chain].residues=[];
  }
  result.chain[chain].residues=result.chain[chain].residues.concat(residues);
}


function addHetnam(line) {
  var residue=line.substring(11,14).trim();
  var name=line.substring(15,70).trim();
  
  if (hetnames[residue]) {
      hetnames[residue]+=" ";
  } else {
    hetnames[residue]="";
  }
  hetnames[residue]+=name;
}

function addCompound(line) {
  compoundsArray.push(line.substr(10).trim());
}

function analyseCompounds() {
  for (var i=0; i<compoundsArray.length; i++) {
  
    var line=compoundsArray[i];
      
    var label=line.replace(/:.*/,"").replace(/;$/,"");
    var value=line.replace(/^[^ ]* /,"").replace(/;$/,"");
    
    if (label=="MOL_ID") {
      var current={};
      current.id=value;
    } else if (label=="CHAIN") {
      var chains=value.split(",");
      for (var j=0; j<chains.length; j++) {
        compounds[chains[j]]=current; 
      }
    } else if (label=="MOLECULE") {
      current.molecule=value;
    } else if (label=="SYNONYM") {
      current.synonym=value;
    } else if (label=="EC") {
      current.ec=value;
    }
  }
  
}


function addStats() {
  var residueStats={};
  var totalResidues=0;
  var totalChains=0;
  var allResidues = [];
  for (var key in result.chain) {
    var chain=result.chain[key];
    totalResidues+=chain.nbResidues;
    totalChains++;
    for (var i=0; i<chain.residues.length; i++) {
      var residue=chain.residues[i];
      allResidues.push(residue);
      if (! residueStats[residue]) {
        residueStats[residue]=0;
      }
      residueStats[residue]++;
    }
    chain.iep=IEP.getIEP(chain.residues);
    delete chain.residues;
  }
  result.residueStats=residueStats;
  result.iep = IEP.getIEP(allResidues);
  
  var percentageAA={};
  var totalAA=0;
  for (var key in aa) {
    percentageAA[key]=0;
  }
  
  for (var key in residueStats) {
    if (aa[key]) percentageAA[key]=residueStats[key];
    totalAA+=residueStats[key];
  }
  for (var key in percentageAA) {
    percentageAA[key]=Math.round((percentageAA[key]/totalAA)*1000)/1000;
  }
  result.percentageAA=percentageAA;
  result.nbResidues=totalResidues;
  result.nbChains=totalChains;
  
}


module.exports={
    parse
};
