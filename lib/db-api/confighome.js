/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var ConfigHome = mongoose.model('ConfigHome');
var log = require('debug')('democracyos:db-api:confighome');
var utils = require('lib/utils');
var normalize = utils.normalize;
var pluck = utils.pluck;

/**
 * Update ConfigHome by `id` and `data`
 *
 * @param {ObjectId|String} data to create confighome
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'confighome' item created or `undefined`
 * @return {Module} `confighome` module
 * @api public
 */

exports.update = function update(id, data, fn) {
  log('Updating confighome %s with %j', id, data);

  exports.get(id, onget);

  function onget(err, confighome) {
    if (err) {
      log('Found error %s', err.message);
      return fn(err);
    };

    // update and save confighome document with data
    confighome.set(data);
    confighome.save(onupdate);
  }

  function onupdate(err, confighome) {
    if (!err) return log('Saved confighome %s', confighome.id), fn(null, confighome);
    return log('Found error %s', err), fn(err);
  }

  return this;
};

/**
 * Search single ConfigHome from query
 *
 * @param {String} query string to search by `hash`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'confighome' single confighome object found or `undefined`
 * @return {Module} `confighome` module
 * @api public
 */

exports.searchOne = function searchOne(query, fn) {
  var hashQuery = new RegExp(query, 'i');

  log('Searching for single confighome matching %s', hashQuery);
  ConfigHome.findOne({ hash: hashQuery }, function (err, confighome) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering confighome %j', confighome);
    fn(null, confighome);
  })

  return this;
};

/**
 * Get single ConfigHome from ObjectId or HexString
 *
 * @param {Mixed} id ObjectId or HexString for ConfigHome
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'confighome' single confighome object found or `undefined`
 * @return {Module} `confighome` module
 * @api public
 */

exports.get = function get (id, fn) {
  log('Looking for confighome %j', id)
  ConfigHome
  .findById(id)
  .exec(function (err, confighome) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering confighome %j', confighome);
    fn(null, confighome);
  });

  return this;
};

/**
 * Create or retrieve ConfigHome from `confighome` descriptor
 *
 * @param {Object|String} ConfigHome object descriptor to use as
 * template for a new ConfigHome or a String with the new ConfigHome's name
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'confighome' single confighome object found or `undefined`
 * @return {Module} `confighome` module
 * @api public
 */

exports.create = function create(confighome, fn) {
  log('Creating new confighome %j', confighome);


  if ('string' === typeof confighome) {
    confighome = { text: confighome }
  };

  if ('string' !== typeof confighome.text) {
    log('Delivering validation error.');

    var errMsg = 'ConfigHome text should be string. '
      + typeof confighome.text
      + ' provided.';

    var err = {};
    err.message = errMsg;
    err.text = 'Validation error.';

    return fn(err);
  };
  
  /*
  (new ConfigHome(confighome)).save(function (err, saved) {
	if (err) return log('Found error %s', err), fn(err);

    log('Delivering confighome %j', saved);
    fn(null, saved);
  });*/
  

  if (!confighome.hash) {
    confighome.hash = normalize(confighome.name);
  }

  (new ConfigHome(confighome)).save(function (err, saved) {
    if (err) {
      if (11000 == err.code) {
        log('Attempt duplication.');
        exports.searchOne(confighome.hash, fn);
      } else {
        log('Found error %j', err);
        fn(err);
      }

      return;
    };

    log('Delivering confighome %j', saved);
    fn(null, saved);
  });

  return this;
};