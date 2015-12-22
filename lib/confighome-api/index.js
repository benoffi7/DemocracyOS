/**
 * Module dependencies.
 */

var express = require('express');
var utils = require('lib/utils');
var accepts = require('lib/accepts')
var signup = require('lib/signup-api/lib/signup');
var l10n = require('lib/l10n');
var restrict = utils.restrict;
var staff = utils.staff;
var pluck = utils.pluck;
var api = require('lib/db-api');
var expose = utils.expose;
var log = require('debug')('democracyos:confighome');

var app = module.exports = express();

/**
 * Limit request to json format only
 */

app.use(accepts('application/json'));

app.get('/confighome/config', function (req, res) {
  log('Request confighome/config');

  api.confighome.get('56788c7ad07a6b6cdd8d582d', function (err, confighomeDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving confighome %s', confighomeDoc.hash);
    var keys = [
      'id hash text image'
    ].join(' ');

    res.json(expose(keys)(confighomeDoc));
  });
});


app.post('/confighome/create', restrict, staff, function (req, res, next) {
  log('Request /confighome/create %j', req.body.confighome);

  api.confighome.create(req.body, function (err, confighomeDoc) {
    if (err) return next(err);
    var keys = [
      'id hash text image createdAt deletedAt'
    ].join(' ');
    res.json(expose(keys)(confighomeDoc));
  });
});

app.get('/confighome/:id', restrict, function (req, res) {
  log('Request GET /confighome/%s', req.params.id);

  api.confighome.get(req.params.id, function (err, confighomeDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving confighome %s', confighomeDoc.id);
    var keys = [
      'id hash text image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(confighomeDoc.toJSON()));
  });
});

app.post('/confighome/:id', restrict, staff, function (req, res) {
  log('Request POST /confighome/%s', req.params.id);

  api.confighome.update(req.params.id, req.body, function (err, confighomeDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving confighome %s', confighomeDoc.id);
    var keys = [
      'id hash text image createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(confighomeDoc.toJSON()));
  });
})


function _handleError (err, req, res) {
  res.format({
    html: function() {
      // this should be handled better!
      // maybe with flash or even an
      // error page.
      log('Error found with html request %j', err);
      res.redirect('back');
    },
    json: function() {
      log("Error found: %j", err);
      res.json({ error: err });
    }
  })
}
