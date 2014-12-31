global.__base = __dirname + '/';

console.log(global.__base);

var http = require('http');
var Spreadsheet = require(__base + '../spreadhseet-powa');
var options = {};

var spread = new Spreadsheet();

var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  
  
  spread.init({
	email: '953651403781-7a94m3crdala8d87imj6t3j5od67t1e9@developer.gserviceaccount.com',
    key_file: 'your-key-file.pem'
  });
  
  console.log("after init");
  
  spread.connect(load_databases(response), on_error);
});

function load_databases(response) {
	console.log("before get databases, token : " + spread.config.current_token);
	
	spread.get_databases(function(databases) {
		response.end("ee, databases : " + databases + ", length : " + databases.length);
	});
}

function load_database() {
	spread.prepare_database({ id: '1tsKAhbkzfoKnYZTSKDUqHdqq0CUq9kFQ8zhfifNfZAs' },
	  function (content) {
		response.end("Content : " + content);
	  }, 
	  function (error) {
		  response.end("Content Error: " + error);
	});
}

function on_error(rrror) {
	response.end(error);
}

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);