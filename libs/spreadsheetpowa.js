var EventEmitter = require('events').EventEmitter;
var merge = require('utils-merge');
var proto = require('./proto');

module.exports = create_powa;

function create_powa() {
	merge(app, EventEmitter.prototype);
}