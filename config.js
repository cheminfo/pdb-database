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
    fullConfig = config;
    return fullConfig;
};