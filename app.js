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
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/login.html'));
});

app.get('/home' , (request, response) => {
  response.render('index');
})

app.get('/users', (request, response) => {
	var requestString = serveradress+'admin/usuarios';
	Request.get(requestString,(error, resp, body) => {
		if (error) {
			response.send('Could not connect to server');
		}
		var obj = JSON.parse(body);
		response.render('usuarios',{data:obj});
	});
});

app.get('/rests', (request, response) => {
	var requestString = serveradress+'rests/2000/9.856030/-83.912634';
	Request.get(requestString,(error, resp, body) => {
		if (error) {
			response.send('Could not connect to server');
		}
		var obj = JSON.parse(body);
		response.render('rests',{data:obj});
	});
});

app.get('/rest/:id', (request, response) => {
	var id = request.params.id;
	var restString = serveradress+'rest/'+id;
	var restaurante = {};
	Request.get(restString,(error, resp, body) => {
		if (error) {
			response.send('Could not connect to server');
		}
		restaurante = JSON.parse(body);
	});
	commentString = serveradress+'comments/'+id;
	Request.get(commentString,(error, resp, body) => {
		if (error) {
			response.send('Could not connect to server');
		}
		if (restaurante!=undefined){
			var comentarios = JSON.parse(body);
			response.render('restdetails', {rest:restaurante[0], comments:comentarios});
		}
	});
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		//request the authentication from server
    var requestString = serveradress+'admin/'+username+'/'+password;
    Request.get(requestString, (error, resp, body) => {
      if (error) {
        response.send('Could not connect to server');
      }
      var obj = JSON.parse(body);

      if (obj[0].autenticaadmin==true) {

        request.session.loggedin = true;
        request.session.username = username;
        response.redirect('/home');
      } else {
				response.send('Incorrect Username and/or Password!');
			}
    });
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


var server = app.listen(PORT, function () {
    console.log("app running on port.", server.address().port);
});
