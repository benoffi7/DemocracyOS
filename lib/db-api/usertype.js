/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var UserType = mongoose.model('UserType');
var log = require('debug')('democracyos:db-api:usertype');
var utils = require('lib/utils');
var normalize = utils.normalize;
var pluck = utils.pluck;

/**
 * Get all userstypes
 *
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'userstypes' list of items found or `undefined`
 * @return {Module} `userstypes` module
 * @api public
 */

exports.all = function all(fn) {
  log('Looking for all userstypes.');

  UserType
  .find()
  .sort('+name')
  .exec(function (err, userstypes) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering userstypes %j', pluck(userstypes, 'id'));
    fn(null, userstypes);
  });

  return this;
};

/**
 * Get allActive userstypes active
 *
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'userstypes' list of items found or `undefined`
 * @return {Module} `userstypes` module
 * @api public
 */

exports.allActive = function allActive(fn) {
  log('Looking for all userstypes active.');

  UserType
  .find({ deletedAt: null })
  .sort('+name')
  .exec(function (err, userstypes) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering userstypes active %j', pluck(userstypes, 'id'));
    fn(null, userstypes);
  });

  return this;
};

/**
 * Search userstypes from query
 *
 * @param {String} query string to search by `hash`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'userstypes' list of userstypes objects found or `undefined`
 * @return {Module} `usertype` module
 * @api public
 */

exports.search = function search(query, fn) {
  var hashQuery = new RegExp('.*' + query + '.*','i');

  log('Searching for userstypes matching %s', hashQuery);
  UserType.find({ hash: hashQuery }, function(err, userstypes) {
    if (err) {
      log('Found error: %j', err);
      return fn(err);
    }

    log('Found userstypes %j for %s', userstypes, hashQuery)
    fn(null, userstypes);
  });

  return this;
};

/**
 * Update UserType by `id` and `data`
 *
 * @param {ObjectId|String} data to create usertype
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'usertype' item created or `undefined`
 * @return {Module} `usertype` module
 * @api public
 */

exports.update = function update(id, data, fn) {
  log('Updating usertype %s with %j', id, data);

  exports.get(id, onget);

  function onget(err, usertype) {
    if (err) {
      log('Found error %s', err.message);
      return fn(err);
    };

    // update and save usertype document with data
    usertype.set(data);
    usertype.save(onupdate);
  }

  function onupdate(err, usertype) {
    if (!err) return log('Saved usertype %s', usertype.id), fn(null, usertype);
    return log('Found error %s', err), fn(err);
  }

  return this;
};

/**
 * Search single UserType from query
 *
 * @param {String} query string to search by `hash`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'usertype' single usertype object found or `undefined`
 * @return {Module} `usertype` module
 * @api public
 */

exports.searchOne = function searchOne(query, fn) {
  var hashQuery = new RegExp(query, 'i');

  log('Searching for single usertype matching %s', hashQuery);
  UserType.findOne({ hash: hashQuery }, function (err, usertype) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering usertype %j', usertype);
    fn(null, usertype);
  })

  return this;
};

/**
 * Get single UserType from ObjectId or HexString
 *
 * @param {Mixed} id ObjectId or HexString for UserType
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'usertype' single usertype object found or `undefined`
 * @return {Module} `usertype` module
 * @api public
 */

exports.get = function get (id, fn) {
  log('Looking for usertype %j', id)
  UserType.findById(id, function (err, usertype) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering usertype %j', usertype);
    fn(null, usertype)
  })

  return this;
};

/**
 * Create or retrieve UserType from `usertype` descriptor
 *
 * @param {Object|String} UserType object descriptor to use as
 * template for a new UserType or a String with the new UserType's name
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'usertype' single usertype object found or `undefined`
 * @return {Module} `usertype` module
 * @api public
 */

exports.create = function create(usertype, fn) {
  log('Creating new usertype %j', usertype);


  if ('string' === typeof usertype) {
    usertype = { name: usertype }
  };

  if ('string' !== typeof usertype.name) {
    log('Delivering validation error.');

    var errMsg = 'UserType name should be string. '
      + typeof usertype.name
      + ' provided.';

    var err = {};
    err.message = errMsg;
    err.name = 'Validation error.';

    return fn(err);
  };
  
  /*
  (new UserType(usertype)).save(function (err, saved) {
	if (err) return log('Found error %s', err), fn(err);

    log('Delivering usertype %j', saved);
    fn(null, saved);
  });*/
  

  if (!usertype.hash) {
    usertype.hash = normalize(usertype.name);
  }

  (new UserType(usertype)).save(function (err, saved) {
    if (err) {
      if (11000 == err.code) {
        log('Attempt duplication.');
        exports.searchOne(usertype.hash, fn);
      } else {
        log('Found error %j', err);
        fn(err);
      }

      return;
    };

    log('Delivering usertype %j', saved);
    fn(null, saved);
  });

  return this;
};