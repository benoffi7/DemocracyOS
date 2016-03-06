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


/**
 * Paragraph Schema
 */

var ParagraphSchemaCon = new Schema({
    markup:   { type: String }
  , position: { type: Number }
  , empty:    { type: Boolean, default: false }
});

mongoose.model('ParagraphCon', ParagraphSchemaCon);

var ConfigHomeSchema = new Schema({
    hash: { type: String, lowercase: true, trim: true, required: true }
  , iGmail: { type: Number, default: 0}
  , text: { type: String, trim: true, required: true }
  , logo: { type: String, required: true}  
  , menuColor: { type: String, required: true}
  , acercade: [ParagraphSchemaCon]
  , comofunciona: [ParagraphSchemaCon]
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

/**
 * Compile acercade to render
 * text content
 *
 * @return {String} acercade
 * @api public
 */

ConfigHomeSchema.virtual('acercadeContent').get(function() {
  if (!this.acercade) return;
  return this.acercade.sort(function(a, b) {
    var sort = a.order - b.order;
    sort = sort > 0 ? 1 : -1;
    return sort;
  }).map(function(c) {
    if (c.text) return (c.clauseName ? c.clauseName + ': ' : '') + c.text;
  }).join('\n');
});

/**
 * Compile comofunciona to render
 * text content
 *
 * @return {String} comofunciona
 * @api public
 */

ConfigHomeSchema.virtual('comofuncionaContent').get(function() {
  if (!this.comofunciona) return;
  return this.comofunciona.sort(function(a, b) {
    var sort = a.order - b.order;
    sort = sort > 0 ? 1 : -1;
    return sort;
  }).map(function(c) {
    if (c.text) return (c.clauseName ? c.clauseName + ': ' : '') + c.text;
  }).join('\n');
});

module.exports = function initialize(conn) {
  return conn.model('ConfigHome', ConfigHomeSchema);
};
