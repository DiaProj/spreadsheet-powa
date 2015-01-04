global.__base = __dirname + '/';

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
  
  spread.connect(prepare_database.bind(null, response), on_error);
});

function prepare_database(respons) {
	var database = {
		id: '1tsKAhbkzfoKnYZTSKDUqHdqq0CUq9kFQ8zhfifNfZAs'
	};

	spread.prepare_database(database, function(database) {
		respons.end("tables[0] : " + database.tables[0].id);
	});
}

function load_databases(respons) {
	spread.get_databases(function(databases) {
		respons.end("ee, databases : " + databases + ", length : " + databases[0].id + ', name : ' + databases[0].name);
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