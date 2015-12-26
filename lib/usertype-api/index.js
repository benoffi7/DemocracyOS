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
var config = require('lib/config');
var log = require('debug')('democracyos:userstypes');

var app = module.exports = express();

/**
 * Limit request to json format only
 */

//app.use(accepts('application/json'));

app.get('/userstypes/all', function (req, res) {
  log('Request /userstypes/all');
  api.usertype.all(function (err, userstypes) {
    if (err) return _handleError(err, req, res);

    log('Serving all userstypes');
    res.json(userstypes.map(expose('id hash name image createdAt deletedAt')));
  });
});

app.get('/userstypes/allactive', function (req, res) {
  log('Request /userstypes/allactive');
  api.usertype.allActive(function (err, userstypes) {
    if (err) return _handleError(err, req, res);

    log('Serving all userstypes active');
    res.json(userstypes.map(expose('id hash name image createdAt deletedAt')));
  });
});

app.get('/userstypes/search', function (req, res) {
  log('Request /userstypes/search %j', req.query);
  api.usertype.search(req.query.q, function(err, userstypes) {
    if (err) return _handleError(err, req, res);

    log('Serving userstypes %j', userstypes);
    res.json(userstypes.map(expose('id hash name image createdAt deletedAt')));
  });
});

app.get('/userstypes/:id', function (req, res) {
  log('Request GET /userstypes/%s', req.params.id);

  api.usertype.get(req.params.id, function (err, userstypesDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving userstypes %s', userstypesDoc.id);
    var keys = [
      'id hash name image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(userstypesDoc.toJSON()));
  });
});

app.post('/userstypes/create', restrict, staff, function (req, res, next) {
  log('Request /userstypes/create %j', req.body.userstypes);

  api.usertype.create(req.body, function (err, userstypesDoc) {
    if (err) return next(err);
    var keys = [
      'id hash name image createdAt deletedAt'
    ].join(' ');
    res.json(expose(keys)(userstypesDoc));
  });
});

app.post('/userstypes/:id', restrict, staff, function (req, res) {
  log('Request POST /userstypes/%s', req.params.id);

 fs.readFile(req.files.displayImage.path, function (err, data) {
  // ...
  var newPath = __dirname + "/uploads/uploadedFileName";
  fs.writeFile(newPath, data, function (err) {
    res.redirect("back");
  });
});

  api.usertype.update(req.params.id, req.body, function (err, userstypesDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving userstypes %s', userstypesDoc.id);
    var keys = [
      'id hash name image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(userstypesDoc.toJSON()));
  });
});

app.delete('/userstypes/:id', restrict, staff, actualizarUsuarios, function (req, res) {
  log('Request DELETE /userstypes/%s/', req.params.id);

  api.usertype.get(req.params.id, function (err, usertype) {
    if (err) return _handleError(err, req, res);
    
    usertype.deletedAt = new Date;
    usertype.save(function (err, saved) {
        if (err) return _handleError(err, req, res);
        log('deleted userstypes %s', usertype.id);
        res.json(200);
    });
    
  });
});

app.post('/userstypes/:id/reactivate', restrict, staff, function (req, res) {
  log('Request POST /userstypes/%s/reactivate', req.params.id);

  api.usertype.get(req.params.id, function (err, usertype) {
    if (err) return _handleError(err, req, res);

    usertype.deletedAt = null;
    usertype.save(function (err, saved) {
        if (err) return _handleError(err, req, res);
        log('reactivate userstypes %s', usertype.id);
        res.json(200);
    });  
  });
});

function _handleError (err, req, res) {
  log("Error found: %j", err);
  res.json({ error: err });
}

function actualizarUsuarios(req, res, next){
    api.usertype.searchOne(config.defaultUserType, function (err, usertype) {
        api.usertype.get(req.params.id, function (err, oldUserType) {
            api.user.allByUserType(oldUserType ,function (err, users) {
                if (err) return _handleError(err, req, res);

                users.forEach(function(user){
                    user.usertype= usertype;
                    user.save();
                });

                next();
            });
        });
    });
}