/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Label = mongoose.model('Label');
var log = require('debug')('democracyos:db-api:label');
var utils = require('lib/utils');
var normalize = utils.normalize;
var pluck = utils.pluck;

/**
 * Get all labels
 *
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'labels' list of items found or `undefined`
 * @return {Module} `labels` module
 * @api public
 */

exports.all = function all(fn) {
  log('Looking for all labels.');

  Label
  .find()
  .exec(function (err, labels) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering labels %j', pluck(labels, 'id'));
    fn(null, labels);
  });
  
  return this;
};

/**
 * Get allActive labels active
 *
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'userstypes' list of items found or `undefined`
 * @return {Module} `userstypes` module
 * @api public
 */

exports.allActive = function allActive(fn) {
  log('Looking for all labels active.');

  Label
  .find({ deletedAt: null })
  .sort('+name')
  .exec(function (err, labels) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering labels active %j', pluck(labels, 'id'));
    fn(null, labels);
  });

  return this;
};

/**
 * Search labels from query
 *
 * @param {String} query string to search by `hash`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'labels' list of labels objects found or `undefined`
 * @return {Module} `Label` module
 * @api public
 */

exports.search = function search(query, fn) {
  var hashQuery = new RegExp('.*' + query + '.*','i');

  log('Searching for labels matching %s', hashQuery);
  Label.find({ hash: hashQuery }, function(err, labels) {
    if (err) {
      log('Found error: %j', err);
      return fn(err);
    }

    log('Found labels %j for %s', labels, hashQuery)
    fn(null, labels);
  });

  return this;
};

/**
 * Update Label by `id` and `data`
 *
 * @param {ObjectId|String} data to create Label
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'Label' item created or `undefined`
 * @return {Module} `Label` module
 * @api public
 */

exports.update = function update(id, data, fn) {
  log('Updating Label %s with %j', id, data);

  exports.get(id, onget);

  function onget(err, label) {
    if (err) {
      log('Found error %s', err.message);
      return fn(err);
    };

    // update and save label document with data
    label.set(data);
    label.save(onupdate);
  }

  function onupdate(err, label) {
    if (!err) return log('Saved label %s', label.id), fn(null, label);
    return log('Found error %s', err), fn(err);
  }

  return this;
};

/**
 * Search single Label from query
 *
 * @param {String} query string to search by `hash`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'label' single label object found or `undefined`
 * @return {Module} `label` module
 * @api public
 */

exports.searchOne = function searchOne(query, fn) {
  var hashQuery = new RegExp(query, 'i');

  log('Searching for single label matching %s', hashQuery);
  Label.findOne({ hash: hashQuery }, function (err, label) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering label %j', label);
    fn(null, label);
  })

  return this;
};

/**
 * Get single Label from ObjectId or HexString
 *
 * @param {Mixed} id ObjectId or HexString for Label
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'label' single label object found or `undefined`
 * @return {Module} `label` module
 * @api public
 */

exports.get = function get (id, fn) {
  log('Looking for label %j', id)
  Label.findById(id, function (err, label) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering label %j', label);
    fn(null, label)
  })

  return this;
};

/**
 * Create or retrieve Label from `label` descriptor
 *
 * @param {Object|String} Label object descriptor to use as
 * template for a new Label or a String with the new Label's name
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'label' single label object found or `undefined`
 * @return {Module} `label` module
 * @api public
 */

exports.create = function create(label, fn) {
  log('Creating new label %j', label);


  if ('string' === typeof label) {
    label = { name: label }
  };

  if ('string' !== typeof label.name) {
    log('Delivering validation error.');

    var errMsg = 'Label name should be string. '
      + typeof label.name
      + ' provided.';

    var err = {};
    err.message = errMsg;
    err.name = 'Validation error.';

    return fn(err);
  };
  
  /*
  (new Label(label)).save(function (err, saved) {
	if (err) return log('Found error %s', err), fn(err);

    log('Delivering label %j', saved);
    fn(null, saved);
  });*/
  

  if (!label.hash) {
    label.hash = normalize(label.name);
  }

  (new Label(label)).save(function (err, saved) {
    if (err) {
      if (11000 == err.code) {
        log('Attempt duplication.');
        exports.searchOne(label.hash, fn);
      } else {
        log('Found error %j', err);
        fn(err);
      }

      return;
    };

    log('Delivering label %j', saved);
    fn(null, saved);
  });

  return this;
};