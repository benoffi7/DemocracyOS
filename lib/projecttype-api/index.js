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
var config = require('lib/config');
var log = require('debug')('democracyos:projectstypes');

var app = module.exports = express();

/**
 * Limit request to json format only
 */

app.use(accepts('application/json'));

app.get('/projectstypes/all', function (req, res) {
  log('Request /projectstypes/all');
  api.projecttype.all(function (err, projectstypes) {
    if (err) return _handleError(err, req, res);

    log('Serving all projectstypes');
    res.json(projectstypes.map(expose('id hash name image createdAt deletedAt')));
  });
});

app.get('/projectstypes/allactive', function (req, res) {
  log('Request /projectstypes/allactive');
  api.projecttype.allActive(function (err, projectstypes) {
    if (err) return _handleError(err, req, res);

    log('Serving all projectstypes active');
    res.json(projectstypes.map(expose('id hash name image createdAt deletedAt')));
  });
});

app.get('/projectstypes/allactiveusertype', function (req, res) {
  log('Request /projectstypes/allactiveusertype');
  api.usertype.get(req.query.id, function (err, usertype) {
    if (err) return _handleError(err, req, res);
    
    api.projecttype.allActiveOfUsertype(usertype.projectsTypes, function (err, projectstypes) {
        if (err) return _handleError(err, req, res);

        log('Serving all projectstypes active');
        res.json(projectstypes.map(expose('id hash name image createdAt deletedAt')));
    });
  
  });
  
});

app.get('/projectstypes/search', function (req, res) {
  log('Request /projectstypes/search %j', req.query);
  api.projecttype.search(req.query.q, function(err, projectstypes) {
    if (err) return _handleError(err, req, res);

    log('Serving projectstypes %j', projectstypes);
    res.json(projectstypes.map(expose('id hash name image createdAt deletedAt')));
  });
});

app.get('/projectstypes/:id', function (req, res) {
  log('Request GET /projectstypes/%s', req.params.id);

  api.projecttype.get(req.params.id, function (err, projectstypesDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving projectstypes %s', projectstypesDoc.id);
    var keys = [
      'id hash name image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(projectstypesDoc.toJSON()));
  });
});

app.post('/projectstypes/create', restrict, staff, function (req, res, next) {
  log('Request /projectstypes/create %j', req.body.projectstypes);

  api.projecttype.create(req.body, function (err, projectstypesDoc) {
    if (err) return next(err);
    var keys = [
      'id hash name image createdAt deletedAt'
    ].join(' ');
    res.json(expose(keys)(projectstypesDoc));
  });
});

app.post('/projectstypes/:id', restrict, staff, function (req, res) {
  log('Request POST /projectstypes/%s', req.params.id);

  api.projecttype.update(req.params.id, req.body, function (err, projectstypesDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving projectstypes %s', projectstypesDoc.id);
    var keys = [
      'id hash name image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(projectstypesDoc.toJSON()));
  });
});

app.delete('/projectstypes/:id', restrict, staff, actualizarTopics, function (req, res) {
  log('Request POST /projectstypes/%s/delete', req.params.id);

  api.projecttype.get(req.params.id, function (err, projectstypes) {
    if (err) return _handleError(err, req, res);

    projectstypes.deletedAt = new Date;
    projectstypes.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('deleted projectstypes %s', projectstypes.id);
      res.json(200);
    });
  });
});

function actualizarTopics(req, res, next){
    api.projecttype.searchOne(config.defaultProjectType, function (err, projectType) {
        api.projecttype.get(req.params.id, function (err, oldProjectType) {
            api.topic.allByProjectType(oldProjectType ,function (err, topics) {
                if (err) return _handleError(err, req, res);

                topics.forEach(function(topic){
                    topic.projecttype= projectType;
                    topic.save();
                });

                next();
            });
        });
    });
}

app.post('/projectstypes/:id/reactivate', restrict, staff, function (req, res) {
  log('Request POST /projectstypes/%s/reactivate', req.params.id);

  api.projecttype.get(req.params.id, function (err, projectstypes) {
    if (err) return _handleError(err, req, res);

    projectstypes.deletedAt = null;
    projectstypes.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('reactivate projectstypes %s', projectstypes.id);
      res.json(200);
    });
  });
});

function _handleError (err, req, res) {
  log("Error found: %j", err);
  res.json({ error: err });
}