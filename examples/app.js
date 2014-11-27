global.__base = __dirname + '/';

console.log(global.__base);

var http = require('http');
var Spreadsheet = require(__base + '../spreadhseet-powa');
var options = {};

var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  
  var spread = new Spreadsheet();
  
  spread.init({
	email: '953651403781-7a94m3crdala8d87imj6t3j5od67t1e9@developer.gserviceaccount.com',
    key_file: 'your-key-file.pem'
  });
  
  spread.connect(function() {
	
	spread.prepare_database({id: '1tsKAhbkzfoKnYZTSKDUqHdqq0CUq9kFQ8zhfifNfZAs' }, function(content) {
		response.end("Content : " + content);
	});
	
  });
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);