var EventEmitter = require('events').EventEmitter;
var merge = require('utils-merge');
var google_oauth = require('google-oauth-jwt');
var request_http = require('request');

var env = process.env.NODE_ENV || 'development';
var spreadsheet_scope = 'https://spreadsheets.google.com/feeds';

var exports = module.exports = function spreadsheetpowa(options) {
	options = options || {};
};

exports.prototype.config = {
							email: null,
							key_file: null,
							token: {
								type: 'Bearer'
							},
							scopes: [spreadsheet_scope]
						};

set_token = function (token) {
    var self = this;
	
    if (token.type == 'GoogleLogin')
        token.value = 'auth=' + token.value;
	else if(token.type == null || typeof(token.type) == 'undefined')
		token.type = 'Bearer';
		
    return {
        'Authorization': token.type + ' ' + token.token,
        'Content-Type': 'application/atom+xml',
        'GData-Version': '3.0',
        'If-Match': '*'
    };
};

get_option_get = function(url, token) {
	return {
		url: url,
		method: 'GET',
		headers: setToken({
			token: token   
		})
	};
};

exports.prototype.init = function(options) {
	var self = this;
	
	self.config.email = options.email;
	self.config.key_file = options.key_file;
};
	
exports.prototype.connect = function() {
	var self = this;

	google_oauth.authenticate({
        email: self.config.email,
        keyFile: self.config.key_file,
        scopes: self.config.scopes
    }, function (err, token) {
        if (!err) {
			
		}
	});
};

