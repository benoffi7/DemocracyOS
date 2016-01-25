var express = require('express');
var app = module.exports = express();
var fs = require("fs");

app.get('/usertype/:id', function(req, res){
	fs.exists('uploads/usertype/' + req.params.id, function(exists){
		if(exists){
			var img = fs.readFileSync('uploads/usertype/' + req.params.id);
			res.writeHead(200, {'Content-Type': 'image/*' });
			res.end(img, 'binary');
		}else{
			res.writeHead(400, {'Content-Type': 'image/*' });
			res.end();
		}
	});
	
});

app.get('/user/:id', function(req, res){
	fs.exists('uploads/user/' + req.params.id, function(exists){
		if(exists){
			var img = fs.readFileSync('uploads/user/' + req.params.id);
			res.writeHead(200, {'Content-Type': 'image/*' });
			res.end(img, 'binary');
		}else{
			res.writeHead(400, {'Content-Type': 'image/*' });
			res.end();
		}
	});
});

app.get('/logo', function(req, res){
	fs.exists('uploads/logo', function(exists){
		if(exists){
			var img = fs.readFileSync('uploads/logo');
			res.writeHead(200, {'Content-Type': 'image/*' });
			res.end(img, 'binary');
		}else{
			res.writeHead(400, {'Content-Type': 'image/*' });
			res.end();
		}
	});
});