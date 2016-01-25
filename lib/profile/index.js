/**
 * Module dependencies.
 */

var express = require('express');
var utils = require('lib/utils');
var restrict = utils.restrict;
var log = require('debug')('democracyos:profile');
var t = require('t-component');
var config = require('lib/config');

/**
 * Exports Application
 */

var app = module.exports = express();

app.get('/profile/:id', require('lib/layout'));