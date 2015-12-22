/**
 * Extend module's NODE_PATH
 * HACK: temporary solution
 */

require('node-path')(module);

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var log = require('debug')('democracyos:models:confighome');
var regex = require('lib/regexps');


var ConfigHomeSchema = new Schema({
	hash: { type: String, lowercase: true, trim: true, required: true }
  , text: { type: String, trim: true, required: true }
  , image: { type: String, default: 'none' }
  , createdAt: { type: Date, default: Date.now }
  , deletedAt: { type: Date }
});

/**
 * Define Schema Indexes for MongoDB
 */

ConfigHomeSchema.index({ createdAt: -1 });
ConfigHomeSchema.index({ hash: 1 }, { unique: true, dropDups: true });

/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

ConfigHomeSchema.set('toObject', { getters: true });
ConfigHomeSchema.set('toJSON', { getters: true });

module.exports = function initialize(conn) {
  return conn.model('ConfigHome', ConfigHomeSchema);
};
