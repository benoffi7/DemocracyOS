/**
 * Module dependencies.
 */

var express = require('express');
var log = require('debug')('democracyos:topic');
var package = require('../../package');

var app = module.exports = express();

/**
 * Limit request to json format only
 */

app.get('/', function (req, res) {
  res.json({app: 'democracyos', env: process.env.NODE_ENV, version: package.version, apiUrl: '/api-image'});
});


