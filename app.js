var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var Request = require("request");

var app = express();

const PORT = process.env.PORT || 5000
var serveradress = 'https://moviles1-db.herokuapp.com/';

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/login.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		//request the authentication from server
    Request.get(serveradress+'admin/'+username+'/'+password, (error, resp, body) => {
      if (error) {
        response.send('Could not connect to server');
      }
      console.log(JSON.parse(body));
    });
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

var server = app.listen(PORT, function () {
    console.log("app running on port.", server.address().port);
});
