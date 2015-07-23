var config = require('./config.json');
var url = require('url');

var fullConfig = null;

exports = module.exports = function() {
    if(fullConfig) {
        return fullConfig;
    }
    var couchUrl = url.parse(config.couch.url);
    if(!couchUrl.auth && config.couch.user && config.couch.password) {
        couchUrl.auth = config.couch.user + ':' + config.couch.password;
    }
    if(!couchUrl.port && config.couch.port) {
        delete couchUrl.host;
        couchUrl.port = '' + config.couch.port;
    }
    config.couch.fullUrl = url.format(couchUrl);

    // Make sure of trailing slash
    if(config.asymetrical.rsync && config.asymetrical.rsync.destination) {
        config.asymetrical.rsync.destination = config.asymetrical.rsync.destination.replace(/\/$/, '') + '/';
    }
    if(config.bioAssembly.rsync && config.bioAssembly.rsync) {
        config.bioAssembly.rsync.destination = config.bioAssembly.rsync.destination.replace(/\/$/, '') + '/';
    }
    fullConfig = config;
    return fullConfig;
};
