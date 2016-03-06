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
var log = require('debug')('democracyos:models:label');
var regex = require('lib/regexps');


var LabelSchema = new Schema({
    hash: { type: String, lowercase: true, trim: true, required: true }
  , name: { type: String, trim: true, required: true }
  , createdAt: { type: Date, default: Date.now }
  , deletedAt: { type: Date }
});

/**
 * Define Schema Indexes for MongoDB
 */

LabelSchema.index({ createdAt: -1 });
LabelSchema.index({ hash: 1 }, { unique: true, dropDups: true });

/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

LabelSchema.set('toObject', { getters: true });
LabelSchema.set('toJSON', { getters: true });

module.exports = function initialize(conn) {
  return conn.model('Label', LabelSchema);
};
