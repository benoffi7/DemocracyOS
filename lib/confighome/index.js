/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express();

app.get('/confighome', require('lib/layout'));