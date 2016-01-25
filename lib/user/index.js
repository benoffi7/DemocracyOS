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
var log = require('debug')('democracyos:user');

var app = module.exports = express();

/**
 * Limit request to json format only
 */

app.use(accepts('application/json'));

app.get('/user/me', restrict, function (req, res) {
  log('Request user/me');

  log('Serving user %j', req.user.id);
  res.json(api.user.expose.confidential(req.user));
});

app.get('/user/all', function (req, res) {
  log('Request /userstypes/all');
  api.user.all(function (err, users) {
    if (err) return _handleError(err, req, res);

    log('Serving all userstypes');
    res.json(users.map(expose('id email fullName levelType usertype createdAt deletedAt')));
  });
});

app.get('/user/allfilter/:level/:state', function (req, res) {
  log('Request /users/all');
  var level=req.params.level;
  var state=req.params.state;
  log('Looking for all users.' + level + "-" + state);
  api.user.allFilter(level, state, function (err, users) {
    if (err) return _handleError(err, req, res);

    log('Serving all users. Filter');
    res.json(users.map(expose('id email fullName levelType usertype createdAt deletedAt')));
  });
});

app.get('/user/search', restrict, function (req, res) {
  var q = req.param('q');

  log('Request user/search %j', q);

  api.user.search(q, function(err, users) {
    if (err) return _handleError(err, req, res);

    log('Serving users %j', pluck(users, 'id'));
    res.json(users.map(api.user.expose.ordinary));
  });
});

app.get('/user/lookup', function (req, res) {
  var ids = req.param('ids');

  log('Request user/lookup %j', ids);

  if (!ids) return log('Cannot process without ids'), res.json(500,{});

  api.user.lookup(ids.split(','), function(err, users) {
    if (err) return _handleError(err, req, res);

    log('Serving users %j', pluck(users, 'id'));
    res.json(users.map(api.user.expose.ordinary));
  });
});

// This is a temporary hack while lookinf for a better solution to
// this error: 414 Request-URI Too Large
app.post('/user/lookup', function (req, res) {
  var ids = req.param('ids');

  log('Request user/lookup %j', ids);

  if (!ids) return log('Cannot process without ids'), res.json(500,{});

  api.user.lookup(ids, function(err, users) {
    if (err) return _handleError(err, req, res);

    log('Serving users %j', pluck(users, 'id'));
    res.json(users.map(api.user.expose.ordinary));
  });
});

app.post('/user/create', restrict, staff, function (req, res, next) {
  log('Request /users/create %j', req.body.user);
  var meta = {
    ip: req.ip,
    ips: req.ips,
    host: req.get('host'),
    origin: req.get('origin'),
    referer: req.get('referer'),
    ua: req.get('user-agent')
  };

  var profile = req.body;
  profile.locale = l10n.requestLocale(req);

  signup.doSignUpByStaff(profile, meta, function (err) {
    if (err) return res.json(200, { error: err.message });
    return res.json(200);
  });
  
  /*
  api.user.create(req.body, function (err, userDoc) {
    if (err) return next(err);
    var keys = [
	  'id firstName lastName username locale email emailValidated profiles createdAt updatedAt profilePictureUrl disabledAt notifications'
    ].join(' ');
    res.json(expose(keys)(userDoc));
  });
  */
});

app.get('/user/profile/:id', restrict, function (req, res) {
  log('Request user/%s', req.params.id);

  api.user.getProfile(req.params.id, function (err, user) {
    if (err) return _handleError(err, req, res);

    log('Serving user %j', user.id);
    var keys = [
	  'id firstName lastName fullName username levelType usertype locale email',
           'web facebook twitter linkedin googlePlus youtube profilePictureUrl avatar'
    ].join(' ');
    res.json(expose(keys)(user));
  });
});

app.get('/user/:id', restrict, function (req, res) {
  log('Request user/%s', req.params.id);

  api.user.get(req.params.id, function (err, user) {
    if (err) return _handleError(err, req, res);

    log('Serving user %j', user.id);
    var keys = [
	  'id firstName lastName username level usertype locale email emailValidated profiles createdAt updatedAt',
           'web facebook twitter linkedin googlePlus youtube profilePictureUrl disabledAt notifications'
    ].join(' ');
    res.json(expose(keys)(user));
  });
});

app.post('/user/:id', restrict, staff, function (req, res) {
  log('Request POST /tag/%s', req.params.id);
  log('Updating user');
  api.user.update(req.params.id, req.body, function (err, userDoc) {
    if (err) return _handleError(err, req, res);

    log('Serving tag %s', userDoc.id);
    var keys = [
	  'id firstName lastName username level usertype locale email emailValidated profiles createdAt updatedAt profilePictureUrl disabledAt notifications'
    ].join(' ');
    res.json(expose(keys)(userDoc));
  });
})

app.delete('/user/:id', restrict, staff, function (req, res) {
  log('Request POST /userlist/%s/delete', req.params.id);

  api.user.get(req.params.id, function (err, user) {
    if (err) return _handleError(err, req, res);

    user.deletedAt = new Date;
    user.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('deleted user %s', user.id);
      res.json(200);
    });
  });
});

app.post('/user/:id/reactivate', restrict, staff, function (req, res) {
  log('Request POST /userlist/%s/reactivate', req.params.id);

  api.user.get(req.params.id, function (err, user) {
    if (err) return _handleError(err, req, res);

    user.deletedAt = null;
    user.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('reactivate user %s', user.id);
      res.json(200);
    });
  });
});

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
