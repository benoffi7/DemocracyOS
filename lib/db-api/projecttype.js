/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var ProjectType = mongoose.model('ProjectType');
var log = require('debug')('democracyos:db-api:projecttype');
var utils = require('lib/utils');
var normalize = utils.normalize;
var pluck = utils.pluck;

/**
 * Get all projectstypes
 *
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'projectstypes' list of items found or `undefined`
 * @return {Module} `projectstypes` module
 * @api public
 */

exports.all = function all(fn) {
  log('Looking for all projectstypes.');

  ProjectType
  .find()
  .exec(function (err, projectstypes) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering projectstypes %j', pluck(projectstypes, 'id'));
    fn(null, projectstypes);
  });
  
  return this;
};

/**
 * Get allActive projectstypes active
 *
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'userstypes' list of items found or `undefined`
 * @return {Module} `userstypes` module
 * @api public
 */

exports.allActive = function allActive(fn) {
  log('Looking for all projectstypes active.');

  ProjectType
  .find({ deletedAt: null })
  .sort('+name')
  .exec(function (err, projectstypes) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering projectstypes active %j', pluck(projectstypes, 'id'));
    fn(null, projectstypes);
  });

  return this;
};

/**
 * Search projectstypes from query
 *
 * @param {String} query string to search by `hash`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'projectstypes' list of projectstypes objects found or `undefined`
 * @return {Module} `projecttype` module
 * @api public
 */

exports.search = function search(query, fn) {
  var hashQuery = new RegExp('.*' + query + '.*','i');

  log('Searching for projectstypes matching %s', hashQuery);
  ProjectType.find({ hash: hashQuery }, function(err, projectstypes) {
    if (err) {
      log('Found error: %j', err);
      return fn(err);
    }

    log('Found projectstypes %j for %s', projectstypes, hashQuery)
    fn(null, projectstypes);
  });

  return this;
};

/**
 * Update ProjectType by `id` and `data`
 *
 * @param {ObjectId|String} data to create projecttype
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'projecttype' item created or `undefined`
 * @return {Module} `projecttype` module
 * @api public
 */

exports.update = function update(id, data, fn) {
  log('Updating projecttype %s with %j', id, data);

  exports.get(id, onget);

  function onget(err, projecttype) {
    if (err) {
      log('Found error %s', err.message);
      return fn(err);
    };

    // update and save projecttype document with data
    projecttype.set(data);
    projecttype.save(onupdate);
  }

  function onupdate(err, projecttype) {
    if (!err) return log('Saved projecttype %s', projecttype.id), fn(null, projecttype);
    return log('Found error %s', err), fn(err);
  }

  return this;
};

/**
 * Search single ProjectType from query
 *
 * @param {String} query string to search by `hash`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'projecttype' single projecttype object found or `undefined`
 * @return {Module} `projecttype` module
 * @api public
 */

exports.searchOne = function searchOne(query, fn) {
  var hashQuery = new RegExp(query, 'i');

  log('Searching for single projecttype matching %s', hashQuery);
  ProjectType.findOne({ hash: hashQuery }, function (err, projecttype) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering projecttype %j', projecttype);
    fn(null, projecttype);
  })

  return this;
};

/**
 * Get single ProjectType from ObjectId or HexString
 *
 * @param {Mixed} id ObjectId or HexString for ProjectType
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'projecttype' single projecttype object found or `undefined`
 * @return {Module} `projecttype` module
 * @api public
 */

exports.get = function get (id, fn) {
  log('Looking for projecttype %j', id)
  ProjectType.findById(id, function (err, projecttype) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering projecttype %j', projecttype);
    fn(null, projecttype)
  })

  return this;
};

/**
 * Create or retrieve ProjectType from `projecttype` descriptor
 *
 * @param {Object|String} ProjectType object descriptor to use as
 * template for a new ProjectType or a String with the new ProjectType's name
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'projecttype' single projecttype object found or `undefined`
 * @return {Module} `projecttype` module
 * @api public
 */

exports.create = function create(projecttype, fn) {
  log('Creating new projecttype %j', projecttype);


  if ('string' === typeof projecttype) {
    projecttype = { name: projecttype }
  };

  if ('string' !== typeof projecttype.name) {
    log('Delivering validation error.');

    var errMsg = 'ProjectType name should be string. '
      + typeof projecttype.name
      + ' provided.';

    var err = {};
    err.message = errMsg;
    err.name = 'Validation error.';

    return fn(err);
  };
  
  /*
  (new ProjectType(projecttype)).save(function (err, saved) {
	if (err) return log('Found error %s', err), fn(err);

    log('Delivering projecttype %j', saved);
    fn(null, saved);
  });*/
  

  if (!projecttype.hash) {
    projecttype.hash = normalize(projecttype.name);
  }

  (new ProjectType(projecttype)).save(function (err, saved) {
    if (err) {
      if (11000 == err.code) {
        log('Attempt duplication.');
        exports.searchOne(projecttype.hash, fn);
      } else {
        log('Found error %j', err);
        fn(err);
      }

      return;
    };

    log('Delivering projecttype %j', saved);
    fn(null, saved);
  });

  return this;
};