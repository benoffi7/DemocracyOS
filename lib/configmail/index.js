/**
 * Module dependencies.
 */

var express = require('express');
var config = require('lib/config');

/**
 * Exports Application
 */

var app = module.exports = express();

app.get('/configmail', require('lib/layout'));
app.get('/configmail/welcome-email', require('lib/layout'));
app.get('/configmail/reset-password', require('lib/layout'));
app.get('/configmail/topic-published', require('lib/layout'));
app.get('/configmail/new-comment', require('lib/layout'));
app.get('/configmail/topic-close', require('lib/layout'));
