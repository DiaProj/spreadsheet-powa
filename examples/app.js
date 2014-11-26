global.__base = __dirname + '/';

console.log(global.__base);

var http = require('http');
var Spreadsheet = require(__base + '../spreadhseet-powa');
var options = {};

var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  
  var spread = new Spreadsheet();
  
  spread.init({
	email: '',
    key_file: 'your-key-file.pem'
  });
  
  spread.connect(function() {
	
	spread.prepare_database({id: '' }, function(content) {
		response.end("Content : " + content);
	});
	
  });
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);