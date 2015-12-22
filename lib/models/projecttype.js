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
var log = require('debug')('democracyos:models:projecttype');
var regex = require('lib/regexps');


var ProjectTypeSchema = new Schema({
	hash: { type: String, lowercase: true, trim: true, required: true }
  , name: { type: String, trim: true, required: true }
  , createdAt: { type: Date, default: Date.now }
  , deletedAt: { type: Date }
});

/**
 * Define Schema Indexes for MongoDB
 */

ProjectTypeSchema.index({ createdAt: -1 });
ProjectTypeSchema.index({ hash: 1 }, { unique: true, dropDups: true });

/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

ProjectTypeSchema.set('toObject', { getters: true });
ProjectTypeSchema.set('toJSON', { getters: true });

module.exports = function initialize(conn) {
  return conn.model('ProjectType', ProjectTypeSchema);
};
