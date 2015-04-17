var config = require('./config.js')();

var pdbParser = require('./pdbParser');


var request = require('request');
var path = require('path');
var _ = require('underscore');
var async = require('async');

var databaseUrl = config.couch.fullUrl + '/' + config.couch.database;

request.get(databaseUrl + '/_all_docs?include_docs=false', function(err, res, body){
  if(err) {
    console.log('ERROR: could not get doc list');
    return;
  }
  var b = JSON.parse(body);
  var docList = _.filter(b.rows, function(val) {
    return val.id.search('_design') === -1;
  });
  console.log('There are ' + docList.length + ' documents');
  
  
  var batch = _.map(docList, function(val) {
    return function(callback) {
      updateDoc(databaseUrl + '/' + val.id, callback);
    };
  });
  
  async.parallelLimit(batch, 5, parallelCallback);
  
});

function parallelCallback(err, res) {
  if(err) {
    if(err.type === 'fatal') {
      process.stderr.write('fatal error');
      process.stderr.write(err.msg ? err.msg : '');
      process.exit(1);
    }
    else if(err.type === 'done') {
      process.stdout.write(err.msg ? err.msg : '');
      process.stdout.write('Done\n');
      process.exit(0);
    }
  }
  else{
    console.log('Everything done');
  }
}


function updateDoc(docUrl, cb) {
  request.get(docUrl, function(err, res, body){
    if(err) {
      console.log('error: ', err);
      cb({type:'fatal'});
      return;
    }
    var b = JSON.parse(body);
    var rev = b._rev;
    
    if(b._attachments) {
      var keys = _.keys(b._attachments);
      if(keys.length > 0) {
        var att = docUrl + '/' + keys[0];
        console.log('Getting attachemint: ', att);
        request.get(att, function(err, res, body){
          if(err) {
            console.log('ERROR: getting ', att);
            cb({type:'fatal'});
            return;
          }
          var fields = pdbParser.parse(body);
          _.extend(b, fields);
          //console.log(b);
          
          request.put(docUrl,{
            body: JSON.stringify(b)
          }, function(err, res, body){
            if(err) {
              console.log('Could not upload document');
              cb({type:'fatal'});
              return;
            }
            console.log(body);
            cb();
            return;
          });
        });
      }
    }
    else {
      console.log('no attachments');
      cb({type:'fatal'});
      return;
    }
  });
}

