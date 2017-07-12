/**
 * Module dependencies.
 */

var express = require('express');
var utils = require('lib/utils');
var restrict = utils.restrict;
var log = require('debug')('democracyos:admin');
var t = require('t-component');
var config = require('lib/config');

/**
 * Exports Application
 */

var app = module.exports = express();

app.get('/acerca-de', require('lib/layout'));
app.get('/como-funciona', require('lib/layout'));