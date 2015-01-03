
var exports = module.exports = function customlogger(options) {
	options = options || {};
};

exports.prototype.display = function(data) {
	var is_debug = app.get('env') === 'development');
}