var EventEmitter = require('events').EventEmitter;
var merge = require('utils-merge');
var util = require('util');
var google_oauth = require('google-oauth-jwt');
var request_http = require('request');
var parse_string = require('xml2js').parseString;

var env = process.env.NODE_ENV || 'development';
var SPREADSHEET_SCOPE = 'https://spreadsheets.google.com/feeds';

var exports = module.exports = function spreadsheetpowa(options) {
	options = options || {};
};

util.inherits(exports, EventEmitter);

exports.prototype.database = null;

exports.prototype.config = {
							email: null,
							key_file: null,
							token: {
								type: 'Bearer'
							},
							scopes: [SPREADSHEET_SCOPE],
							current_token: null
						};

exports.prototype.set_token = function (token) {
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

exports.prototype.get_option_get = function(url, token) {
	var self = this;

	return {
		url: SPREADSHEET_SCOPE + '/' + url,
		method: 'GET',
		headers: self.set_token({
			token: token   
		})
	};
};

/*
  @summary: Initialize parameters of current config
  @params{options}: jSon object of configuration, with email and key_file name (*.pem)
*/
exports.prototype.init = function(options) {
	var self = this;
	
	self.config.email = options.email;
	self.config.key_file = options.key_file;
};
	
/*
	@summary: Connect to google api, and set current_token value of config object
	@params{callback}: Success callback
	@params{error_callback}: Error callback
*/	
exports.prototype.connect = function(callback, error_callback) {
	var self = this;

	google_oauth.authenticate({
        email: self.config.email,
        keyFile: self.config.key_file,
        scopes: self.config.scopes
    }, function (err, token) {
        if (!err) {
			self.config.current_token = token;		
			if(callback != null && typeof(callback) != 'undefined' && typeof(callback) === 'function')
				callback();
		} else if(error_callback != null && typeof(error_callback) != 'undefined' && typeof(error_callback) === 'function') {
			error_callback(err);
		}			
	});
};

/*
	@summary: Prepara database (request to get all worksheet id, columns)
	@params{options}: Options to request worksheet
	@params{callback}: Success callback
	@params{error_callback}: Error callback
*/
exports.prototype.prepare_database = function(options, callback, error_callback) {
	//Url to use : worksheets/key/private/full
	var self = this;	
	var options = self.get_option_get('worksheets/' + options.id + '/private/full',
									  self.config.current_token);
									  
	request_http(options, function(err, response, body) {
		if (!err) {
		    parse_string(body, function (err, result) {
		        if (err == null) {
		            self.database = {
		                tables: []
		            };

		            for (var i = 0; i < result.feed.entry.length; i++) {
		                var entry = result.feed.entry[i];

		                if (entry.id.length > 0) {
		                    var url_get_id = entry.id[0];
		                    var database = {
		                        url: url_get_id,
		                        id: url_get_id.replace(SPREADSHEET_SCOPE + "/worksheets/" + options.id + "/", "")
		                    };

		                    console.log(database.id);

		                    self.database.tables.push(database);
		                }
		            }
		        }

			    if (callback != null && typeof (callback) != 'undefined' && typeof (callback) === 'function')
					callback(result);
			});
		} else if(error_callback != null && typeof(error_callback) != 'undefined' && typeof(error_callback) === 'function') {
			error_callback(err);
		}	
	});
};

/*
	@summary: Request data to one worksheet
	@params{options}: Options to request worksheet
	@params{callback}: Success callback
	@params{error_callback}: Error callback
*/	
exports.prototype.request = function(options, callback, error_callback) {
	var self = this;

	var options = self.get_option_get('list/' + options.id + '/oelo443/private/full?sq=usdescription<>""',
									  self.config.current_token);

	request_http(options, function(err, response, body) {
		if (!err) {
			parse_string(body, function (err, result) {
				if(callback != null && typeof(callback) != 'undefined' && typeof(callback) === 'function')
					callback(result);
			});
		} else if(error_callback != null && typeof(error_callback) != 'undefined' && typeof(error_callback) === 'function') {
			error_callback(err);
		}	
	});
};

