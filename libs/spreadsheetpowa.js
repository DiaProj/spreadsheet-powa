﻿/*
	API google spreadsheet : https://developers.google.com/google-apps/spreadsheets/

*/


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

exports.prototype.databases = null;
exports.prototype.current_database = null;

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
	var formatted_url = SPREADSHEET_SCOPE + '/' + url;
	
	return {
		url: formatted_url,
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
		self.use_callback_or_error(err, callback, error_callback, function() {
			self.config.current_token = token;
		});
	});
};

/*
	@summary: Load list of available databases
*/
exports.prototype.get_databases = function (callback, error_callback) {
    //Url to use : feeds/spreadsheets/private/full
    var self = this;	
    var options = self.get_option_get('spreadsheets/private/full',
									  self.config.current_token);
	
    request_http(options, function (err, response, body) {
		self.use_callback_or_error(err, function() {callback(self.databases);}, error_callback, function() {
			parse_string(body, function (err, result) {	
		        if (err == null) {
					self.databases = [];
					
					for (var i = 0; i < result.feed.entry.length; i++) {
						self.databases.push({
							id: result.feed.entry[i].id[0].replace(SPREADSHEET_SCOPE + '/spreadsheets/', ''),
							name: result.feed.entry[i].title[0],
							tables: []
						});
					}
				}
			});
		});
    });
}

/*
	@summary: Gets database information (id, name, author, ...)
	@params{name}: Name of the searching database
*/
exports.prototype.get_database_informations = function(name) {
    // TODO: 00, EB, to be created
}

/*
	@summary: Prepare database (request to get all worksheet id, columns)
	@params{database}: Database to be loaded (class Database : { id, name})
	@params{callback}: Success callback
	@params{error_callback}: Error callback
*/
exports.prototype.prepare_database = function(database, callback, error_callback) {
	//Url to use : worksheets/{key}/private/full
	var self = this;	
	var current_id = database.id;
	var options = self.get_option_get('worksheets/' + current_id + '/private/full',
									  self.config.current_token);
									  
	request_http(options, function(err, response, body) {
		self.use_callback_or_error(err, function() {}, error_callback, function() {
			parse_string(body, function (err, result) {
		        if (err == null) {
					self.current_database = database;
					self.current_database.tables = [];
					
					for (var i = 0; i < result.feed.entry.length; i++) {
		                var entry = result.feed.entry[i];
						var replace_url = SPREADSHEET_SCOPE + '/worksheets/' + current_id + '/';
						
						self.current_database.tables.push({
							id: entry.id[0].replace(replace_url, ''),
							name: entry.title[0]
						});
						
						self.prepare_table(self.current_database, self.current_database.tables[i], 
							function() {
								if(i == result.feed.entry.length -1)
									callback(self.current_database);
							}, error_callback, 
							function() {}
						);
		            }
				}
			});
		});
	});
};

/*
	@summary: Request data to one table, to load all meta-data (columns, ...)
	@params{database}: Database object to request worksheet
	@params{table}: Table object to request worksheet
	@params{callback}: Success callback
	@params{error_callback}: Error callback
*/
exports.prototype.prepare_table = function(database, table, callback, error_callback) {
	// Url to use :  cells/{database id}/{table id}/private/full
	// Url to use, to know columns of table : cells/{database id}/{table id}/private/full?min-row=1&max-row=1
	
	var self = this;	
	var current_id = database.id;
	var options = self.get_option_get('cells/' + current_id + '/' + table.id + '/private/full?min-row=1&max-row=1',
									  self.config.current_token);
									  
	request_http(options, function(err, response, body) {
		self.use_callback_or_error(err, function() {}, error_callback, function() {
			parse_string(body, function (err, result) {
		        if (err == null) {
					table.columns = [];
					
					for (var i = 0; i < result.feed.entry.length; i++) {
						var entry = result.feed.entry[i];
						var replace_url = SPREADSHEET_SCOPE + '/worksheets/' + current_id + '/';
					
						table.columns.push({
							id: entry.id[0].replace(replace_url, '')
						});
					}
				}
				callback();
			});
		});
	});
}

/*
	@summary: Request data to one worksheet
	@params{database}: Database object to request worksheet
	@params{table}: Table object to request worksheet
	@params{callback}: Success callback
	@params{error_callback}: Error callback
*/	
exports.prototype.request = function(database, table, callback, error_callback) {
	var self = this;

	var options = self.get_option_get('list/' + database.id + '/' + table.name + '/private/full?sq=' + options.query,
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

/*
	@summary: Call back callback success function or, with error, call error function
	@params{err}: Error object
	@params{callback}: Success callback
	@params{error_callback}: Error callback
	@params{next}: Other function to be called when success (called before callback method)
*/
exports.prototype.use_callback_or_error = function(err, callback, error_callback, next) {
	if (!err) {
		if(next != null && typeof(next) != 'undefined' && typeof(next) === 'function') {
			next();
		}
			
		if(callback != null && typeof(callback) != 'undefined' && typeof(callback) === 'function') {
			callback();
		}
	} else if(error_callback != null && typeof(error_callback) != 'undefined' && typeof(error_callback) === 'function') {
			error_callback(err);
	}
}
