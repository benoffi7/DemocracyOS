/**
 * Module dependencies.
 */

var config = require('lib/config');
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var gravatar = require('mongoose-gravatar');
var regexps = require('lib/regexps');
var normalizeEmail = require('lib/normalize-email');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

/**
 * Define `User` Schema
 */

var UserSchema = new Schema({
    firstName: { type: String }
  , lastName:  { type: String }
  , username:  { type: String }
  , usertype: { type: ObjectId, ref: 'UserType'}
  , level:  { type: String, default: '0' }
  , locale:    { type: String, enum: config.availableLocales }
  , email:     { type: String, lowercase: true, trim: true, match: regexps.email } // main email
  , emailValidated: { type: Boolean, default: false }
  , profiles:  {
        facebook: { type: Object }
      , twitter:  { type: Object }
    }
  , favorites: [{type: ObjectId, ref: 'Topic'}]
  , createdAt: { type: Date, default: Date.now }
  , updatedAt: { type: Date }
  , deletedAt: { type: Date }
  , web: { type:String }
  , facebook: { type: String, required: false }
  , twitter: { type: String, required: false}
  , linkedin: { type: String, required: false }
  , googlePlus: { type: String, required: false }
  , youtube: { type: String, required: false }
  , profilePictureUrl: { type: String, required: false }
  , disabledAt: { type: Date }
  , notifications: {
    replies: { type: Boolean, default: true },
    participating: {type: Boolean, default: false},
    share: {type: Boolean, default: true},
    'new-topic': { type: Boolean, default: false }        
  }
});

/**
 * Define Schema Indexes for MongoDB
 */

UserSchema.index({ createdAt: -1 });
UserSchema.index({ firstName: 1, lastName: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'notifications.replies': 1 });
UserSchema.index({ 'notifications.new-topic': 1 });


/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

UserSchema.set('toObject', { getters: true });
UserSchema.set('toJSON', { getters: true });

UserSchema.options.toObject.transform =
UserSchema.options.toJSON.transform = function(doc, ret, options) {
  // remove the hasn and salt of every document before returning the result
  delete ret.hash;
  delete ret.salt;
}

/**
 * -- Model's Plugin Extensions
 */

UserSchema.plugin(gravatar, { default: 'mm', secure: true });

UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  userExistsError: 'El usuario con email %s ya existe',
  missingPasswordError: 'La password esta vacía',
  incorrectUsernameError: 'Nombre de usuario incorrecto',
  incorrectPasswordError: 'Password incorrecta'
});

/**
 * -- Model's API Extension
 */

/**
 * Get `fullName` from `firstName` and `lastName`
 *
 * @return {String} fullName
 * @api public
 */

UserSchema.virtual('fullName').get(function() {
  return this.firstName + ' ' + this.lastName;
});

/**
 * Get `displayName` from `firstName`, `lastName` and `<email>` if `config.publicEmails` === true
 *
 * @return {String} fullName
 * @api public
 */

UserSchema.virtual('displayName').get(function() {
  var displayName = this.fullName

  if (config.publicEmails && config.visibility == 'hidden' && this.email) {
    displayName += ' <' + this.email + '>';
  }

  return displayName;
});


/**
 * Get `levelType` type en forma de descripcion
 * @return {string} levelType
 * @api public
 */
UserSchema.virtual('levelType').get(function() {
  if(this.level == "1"){
      return "Staff";
  }else{
      return "Publicador";
  }
});

/**
 * Get `staff` check from configured staff array
 *
 * @return {Boolean} staff
 * @api public
 */
/*Deprecado
UserSchema.virtual('staff').get(function() {
  var staff = config.staff || [];
  return !!~staff.indexOf(this.email);
});*/

/**
 * Get `staff` check from level on user
 *
 * @return {Boolean} staff
 * @api public
 */
UserSchema.virtual('staff').get(function() {
  var staff = config.staff || [];
  if (!!~staff.indexOf(this.email)){
	  return true;
  }else{
	  //user = this.findOne({ email: normalizeEmail(this.email) }).exec(cb);
	  if(this.level == '1' ){
		return true;
	  }
	  return false;
  }
})

UserSchema.virtual('avatar').get(function() {
  return this.profilePictureUrl
    ? this.profilePictureUrl
    : this.gravatar({ default: 'mm', secure: true });
});

UserSchema.pre('save', function (next) {
  this.email = normalizeEmail(this.email);
  next();
});

/**
 * Is Favorite to User
 *
 * @param {Topic|ObjectId|String} topic
 * @param {Function} cb
 * @api public
 */

UserSchema.methods.isFavorite = function(topicId, cb) {
  return this.favorites.find(topicId);
};

/**
 * Add Favorite to User
 *
 * @param {Topic|ObjectId|String} topic
 * @param {Function} cb
 * @api public
 */

UserSchema.methods.addFavorite = function(topicId, cb) {
  this.favorites.addToSet(topicId);
  if (cb) this.save(cb);
};

/**
 * Delete Favorite to User
 *
 * @param {Topic|ObjectId|String} topic
 * @param {Function} cb
 * @api public
 */

UserSchema.methods.deleteFavorite = function(topicId, cb) {
  this.favorites.remove(topicId); 
  if (cb) this.save(cb);
};

/**
 * Find `User` by its email
 *
 * @param {String} email
 * @return {Error} err
 * @return {User} user
 * @api public
 */

UserSchema.statics.findByEmail = function(email, cb) {
  return this.findOne({ email: normalizeEmail(email) })
    .exec(cb);
}

/**
 * Find `User` by social provider id
 *
 * @param {String|Number} id
 * @param {String} social
 * @return {Error} err
 * @return {User} user
 * @api public
 */

UserSchema.statics.findByProvider = function(profile, cb) {
  var path = 'profiles.'.concat(profile.provider).concat('.id');
  var query = {};
  query[path] = profile.id;
  return this.findOne(query)
    .exec(cb);
}

/**
 * Expose `User` Model
 */

module.exports = function initialize(conn) {
  return conn.model('User', UserSchema);
};
