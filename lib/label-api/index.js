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
var log = require('debug')('democracyos:labels');

var app = module.exports = express();

/**
 * Limit request to json format only
 */

app.use(accepts('application/json'));

app.get('/labels/all', function (req, res) {
  log('Request /labels/all');
  api.label.all(function (err, labels) {
    if (err) return _handleError(err, req, res);

    log('Serving all labels');
    res.json(labels.map(expose('id hash name createdAt deletedAt')));
  });
});

app.get('/labels/allactive', function (req, res) {
  log('Request /labels/allactive');
  api.label.allActive(function (err, labels) {
    if (err) return _handleError(err, req, res);

    log('Serving all labels active');
    res.json(labels.map(expose('id hash name createdAt deletedAt')));
  });
});

app.get('/labels/search', function (req, res) {
  log('Request /labels/search %j', req.query);
  api.label.search(req.query.q, function(err, labels) {
    if (err) return _handleError(err, req, res);

    log('Serving labels %j', labels);
    res.json(labels.map(expose('id hash name createdAt deletedAt')));
  });
});

app.get('/labels/:id', function (req, res) {
  log('Request GET /labels/%s', req.params.id);

  api.label.get(req.params.id, function (err, labelsDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving labels %s', labelsDoc.id);
    var keys = [
      'id hash name image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(labelsDoc.toJSON()));
  });
});

app.post('/labels/create', restrict, staff, function (req, res, next) {
  log('Request /labels/create %j', req.body.labels);

  api.label.create(req.body, function (err, labelsDoc) {
    if (err) return next(err);
    var keys = [
      'id hash name image createdAt deletedAt'
    ].join(' ');
    res.json(expose(keys)(labelsDoc));
  });
});

app.post('/labels/:id', restrict, staff, function (req, res) {
  log('Request POST /labels/%s', req.params.id);

  api.label.update(req.params.id, req.body, function (err, labelsDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving labels %s', labelsDoc.id);
    var keys = [
      'id hash name image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(labelsDoc.toJSON()));
  });
});

app.delete('/labels/:id', restrict, staff, actualizarTopics, function (req, res) {
  log('Request POST /labels/%s/delete', req.params.id);

  api.label.get(req.params.id, function (err, labels) {
    if (err) return _handleError(err, req, res);

    labels.deletedAt = new Date;
    labels.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('deleted labels %s', labels.id);
      res.json(200);
    });
  });
});

function actualizarTopics(req, res, next){
//    api.projecttype.searchOne(config.defaultProjectType, function (err, projectType) {
//        api.projecttype.get(req.params.id, function (err, oldProjectType) {
//            api.topic.allByProjectType(oldProjectType ,function (err, topics) {
//                if (err) return _handleError(err, req, res);
//
//                topics.forEach(function(topic){
//                    topic.projecttype= projectType;
//                    topic.save();
//                });
//
//                next();
//            });
//        });
//    });
    //Eliminar el topic a eliminar.
    next();
}

app.post('/labels/:id/reactivate', restrict, staff, function (req, res) {
  log('Request POST /labels/%s/reactivate', req.params.id);

  api.label.get(req.params.id, function (err, labels) {
    if (err) return _handleError(err, req, res);

    labels.deletedAt = null;
    labels.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('reactivate labels %s', labels.id);
      res.json(200);
    });
  });
});

function _handleError (err, req, res) {
  log("Error found: %j", err);
  res.json({ error: err });
}