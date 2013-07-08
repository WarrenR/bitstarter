var express = require('express');

var fs = fsRequire('fs"');
var buffer = fs.readFileSync('index.html', 'utf-8');

var bufOut = buf.toString(buffer);

Var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(bufOut);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
