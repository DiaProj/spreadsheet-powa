var request = require('google-oauth-jwt');

var app = module.exports = {};

// environment

var env = process.env.NODE_ENV || 'development';

app.prepare = function() {
	request.authenticate({
        email: '953651403781-7a94m3crdala8d87imj6t3j5od67t1e9@developer.gserviceaccount.com',
        keyFile: 'your-key-file.pem',
        scopes: ['https://spreadsheets.google.com/feeds']
    }, function (err, token) {
        if (!err) {
			
		}
	});
}