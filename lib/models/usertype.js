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
var log = require('debug')('democracyos:models:usertype');
var regex = require('lib/regexps');


var UserTypeSchema = new Schema({
	hash: { type: String, lowercase: true, trim: true, required: true }
  , name: { type: String, trim: true, required: true }
  , projectsTypes: [{type: ObjectId, ref: 'ProjectType'}]
  , createdAt: { type: Date, default: Date.now }
  , deletedAt: { type: Date }
});

/**
 * Define Schema Indexes for MongoDB
 */

UserTypeSchema.index({ createdAt: -1 });
UserTypeSchema.index({ hash: 1 }, { unique: true, dropDups: true });

/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

UserTypeSchema.set('toObject', { getters: true });
UserTypeSchema.set('toJSON', { getters: true });

/**
 * Add Project to UserType
 *
 * @param {Topic|ObjectId|String} project
 * @param {Function} cb
 * @api public
 */

UserTypeSchema.methods.addProject = function(projectId, cb) {
  this.projectsTypes.addToSet(projectId);
  if (cb) this.save(cb);
};

/**
 * Delete Project to UserType
 *
 * @param {Topic|ObjectId|String} topic
 * @param {Function} cb
 * @api public
 */

UserTypeSchema.methods.deleteProject = function(projectId, cb) {
  this.projectsTypes.remove(projectId); 
  if (cb) this.save(cb);
};

module.exports = function initialize(conn) {
  return conn.model('UserType', UserTypeSchema);
};
