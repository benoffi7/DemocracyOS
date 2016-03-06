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
var log = require('debug')('democracyos:tag');

var app = module.exports = express();

/**
 * Limit request to json format only
 */

app.use(accepts('application/json'));

app.get('/tag/all', function (req, res) {
  log('Request /tag/all');
  api.tag.all(function (err, tags) {
    if (err) return _handleError(err, req, res);

    log('Serving all tags');
    res.json(tags.map(expose('id hash name color image createdAt deletedAt')));
  });
});

app.get('/tag/allactive', function (req, res) {
  log('Request /tag/allactive');
  api.tag.allActive(function (err, tags) {
    if (err) return _handleError(err, req, res);

    log('Serving all tags active');
    res.json(tags.map(expose('id hash name image createdAt deletedAt')));
  });
});

app.get('/tag/search', function (req, res) {
  log('Request /tag/search %j', req.query);
  api.tag.search(req.query.q, function(err, tags) {
    if (err) return _handleError(err, req, res);

    log('Serving tags %j', tags);
    res.json(tags.map(expose('id hash name color image createdAt deletedAt')));
  });
});

app.get('/tag/hash/:hash', function (req, res) {
  log('Request GET /tag/hash/%s', req.params.hash);

  api.tag.getHash(req.params.hash, function (err, tagDoc) {
    if (err) return _handleError(err, req, res);
    
    log('Serving tag %s', tagDoc.id);
    var keys = [
      'id hash name color image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(tagDoc.toJSON()));
  });
});

app.get('/tag/:id', function (req, res) {
  log('Request GET /tag/%s', req.params.id);

  api.tag.get(req.params.id, function (err, tagDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving tag %s', tagDoc.id);
    var keys = [
      'id hash name color image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(tagDoc.toJSON()));
  });
});

app.post('/tag/create', staff, function (req, res, next) {
  log('Request /tag/create %j', req.body.tag);

  api.tag.create(req.body, function (err, tagDoc) {
    if (err) return next(err);
    var keys = [
      'id hash name color image createdAt deletedAt'
    ].join(' ');
    res.json(expose(keys)(tagDoc));
  });
});

app.post('/tag/:id', staff, function (req, res) {
  log('Request POST /tag/%s', req.params.id);

  api.tag.update(req.params.id, req.body, function (err, tagDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving tag %s', tagDoc.id);
    var keys = [
      'id hash name color image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(tagDoc.toJSON()));
  });
});

app.delete('/tag/:id', restrict, staff, actualizarTopics, function (req, res) {
  log('Request POST /tag/%s/delete', req.params.id);

  api.tag.get(req.params.id, function (err, tag) {
    if (err) return _handleError(err, req, res);

    tag.deletedAt = new Date;
    tag.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('deleted tag %s', tag.id);
      res.json(200);
    });
  });
});

function actualizarTopics(req, res, next){
    api.tag.searchOne(config.defaultTag, function (err, tag) {
        api.tag.get(req.params.id, function (err, oldTag) {
            api.topic.allByTag(oldTag ,function (err, topics) {
                if (err) return _handleError(err, req, res);

                topics.forEach(function(topic){
                    topic.tag= tag;
                    topic.save();
                });

                next();
            });
        });
    });
}

app.post('/tag/:id/reactivate', restrict, staff, function (req, res) {
  log('Request POST /tag/%s/reactivate', req.params.id);

  api.tag.get(req.params.id, function (err, tag) {
    if (err) return _handleError(err, req, res);

    tag.deletedAt = null;
    tag.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('reactivate tag %s', tag.id);
      res.json(200);
    });
  });
});

function _handleError (err, req, res) {
  log("Error found: %j", err);
  res.json({ error: err });
}