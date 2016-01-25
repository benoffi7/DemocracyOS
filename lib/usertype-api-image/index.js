/**
 * Module dependencies.
 */

var express = require('express');
var api = require('lib/db-api');
var accepts = require('lib/accepts');
var utils = require('lib/utils');
var restrict = utils.restrict;
var staff = utils.staff;
var expose = utils.expose;
var fs = require("fs")
var multer  = require('multer')
var upload = multer({ dest: 'uploads/usertype/' })
var log = require('debug')('democracyos:userstypes');

var app = module.exports = express();

app.post('/userstypes/create', restrict, staff, upload.single('displayImage'), function (req, res) {
    log('Request /userstypes/create %j', req.body.userstypes);
  
	api.usertype.create(req.body, function (err, userstypesDoc) {
            if (err) return next(err);
		
            fs.rename('uploads/usertype/' + req.file.filename, 'uploads/usertype/' + userstypesDoc.id);
		
            var keys = [
		'id hash name image createdAt deletedAt'
            ].join(' ');
            res.json(expose(keys)(userstypesDoc));
	});
});

app.post('/userstypes/:id', restrict, staff, upload.single('displayImage'), function (req, res) {
	log('Request POST /userstypes/%s', req.params.id);

    api.usertype.update(req.params.id, req.body, function (err, userstypesDoc) {
        if (err) return _handleError(err, req, res);

        if(req.file){
            fs.rename('uploads/usertype/' + req.file.filename, 'uploads/usertype/' + userstypesDoc.id);
	}

        log('Serving userstypes %s', userstypesDoc.id);
        var keys = [
          'id hash name image createdAt deletedAt'
        ].join(' ');

        res.json(expose(keys)(userstypesDoc.toJSON()));
    });
});

function _handleError (err, req, res) {
  log("Error found: %j", err);
  res.json({ error: err });
}