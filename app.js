var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var Request = require("request");

var app = express();

const PORT = process.env.PORT || 5000
var serveradress = 'https://moviles1-db.herokuapp.com/';

const preciostable = {
    'barato': 1,
    'medio': 2,
    'caro': 3
};

const tipostable = {
    'mexicana': 1,
    'casera': 2,
    'italiana': 3,
    'rapida':4,
    'gourmet':5,
    'caribena':6
};

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
});

app.get('/crearest' , (request, response) => {
  response.render('addrest');
});

app.get('/recover/:mail' , (request, response) => {
  response.sendFile(path.join(__dirname + '/views/recover.html'));
});

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
		obj.forEach((item, next) => {
			var cal = item.calificacion;
			cal = parseFloat(cal).toFixed(1);
			item.calificacion = cal;
		});
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
		var cal = restaurante[0].calificacion;
		cal = parseFloat(cal).toFixed(1);
		restaurante[0].calificacion = cal;
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

app.get('/modify/:id', (request, response) => {
	var id = request.params.id;
	var restString = serveradress+'rest/'+id;
	Request.get(restString,(error, resp, body) => {
		if (error) {
			response.send('Could not connect to server');
		}
		var restaurante = JSON.parse(body);
		response.render('modifyrest', {rest:restaurante[0]});
	});
});

app.get('/borrar/:rest' , (request, response) => {
	var idrest = request.params.rest;
	var requestString = serveradress+'deleterest/'+idrest;
	Request.get(requestString,(error, resp, body) => {
		if (error) {
			response.send('Could not connect to server');
		}
		var obj = JSON.parse(body);
		if (obj.borrado == true) {
			response.redirect('/rests');
		} else {
			response.send('Could not delete restaurant try again');
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

app.post('/addrest', (request, response) => {
	var nombre = request.body.nombrerest;
	var latitud = request.body.latitud;
	var longitud = request.body.longitud;
	var contacto = request.body.contacto;
	var horario = request.body.horario;
	var precio = preciostable[request.body.precio];
  var tipo = tipostable[request.body.tipocomida];
	var requestString = serveradress+'newrest/'+nombre+'/'+latitud+'/'+longitud+'/'+contacto+'/'+horario+'/'+precio+'/'+tipo;
	Request.get(requestString,(error, resp, body) => {
		if (error) {
			response.send('Could not connect to server');
		}
		var obj = JSON.parse(body);
		if (obj != null) {
			response.redirect('/rests');
		}
	});
});

app.post('/modifyrest/:id', (request, response) => {
	var idrest = request.params.id;
	var nombre = request.body.nombrerest;
	var latitud = request.body.latitud;
	var longitud = request.body.longitud;
	var contacto = request.body.contacto;
	var horario = request.body.horario;
	var precio = preciostable[request.body.precio];
  var tipo = tipostable[request.body.tipocomida];
	var requestString = serveradress+'modifyrest/'+idrest+'/'+nombre+'/'+latitud+'/'+longitud+'/'+contacto+'/'+horario+'/'+precio+'/'+tipo;
	console.log(requestString);
	Request.get(requestString,(error, resp, body) => {
		if (error) {
			response.send('Could not connect to server');
		}
		console.log(body);
		var obj = JSON.parse(body);
		if (obj != null) {
			var url = '/rest/'+idrest;
			response.redirect(url);
		}
	});
});

app.post('/recover', (request, response) => {
  var mail = request.body.username;
  var password = request.body.password;
  var tipo = tipostable[request.body.tipocomida];
	var requestString = serveradress+'cambia/'+password+'/'+mail;
	console.log(requestString);
	Request.get(requestString,(error, resp, body) => {
		if (error) {
			response.send('Could not connect to server');
		} else {
      response.send('se cambio la contraseña');
    }
	});
});

var server = app.listen(PORT, function () {
    console.log("app running on port.", server.address().port);
});
