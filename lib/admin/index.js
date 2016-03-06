/**
 * Module dependencies.
 */

var express = require('express');
var utils = require('lib/utils');
var restrict = utils.restrict;
var log = require('debug')('democracyos:admin');
var t = require('t-component');
var config = require('lib/config');
var forumRouter = require('lib/forum-router');

/**
 * Exports Application
 */

var app = module.exports = express();

app.get(forumRouter('/admin'), require('lib/layout'));
app.get(forumRouter('/admin/topics'), require('lib/layout'));
app.get(forumRouter('/admin/topics/:id'), require('lib/layout'));
app.get(forumRouter('/admin/topics/create'), require('lib/layout'));
app.get(forumRouter('/admin/tags'), require('lib/layout'));
app.get(forumRouter('/admin/tags/:id'), require('lib/layout'));
app.get(forumRouter('/admin/tags/create'), require('lib/layout'));
app.get(forumRouter('/admin/users'), require('lib/layout'));
app.get(forumRouter('/admin/users/create'), require('lib/layout'));
app.get(forumRouter('/admin/users/:id'), require('lib/layout'));

app.get(forumRouter('/admin/userstypes'), require('lib/layout'));
app.get(forumRouter('/admin/userstypes/create'), require('lib/layout'));
app.get(forumRouter('/admin/userstypes/:id'), require('lib/layout'));

app.get(forumRouter('/admin/userlist'), require('lib/layout'));
app.get(forumRouter('/admin/userlist/level/:level/state/:state'), require('lib/layout'));
app.get(forumRouter('/admin/userlist/create'), require('lib/layout'));
app.get(forumRouter('/admin/userlist/:id'), require('lib/layout'));

app.get(forumRouter('/admin/projectstypes'), require('lib/layout'));
app.get(forumRouter('/admin/projectstypes/create'), require('lib/layout'));
app.get(forumRouter('/admin/projectstypes/:id'), require('lib/layout'));

app.get(forumRouter('/admin/labels'), require('lib/layout'));
app.get(forumRouter('/admin/labels/create'), require('lib/layout'));
app.get(forumRouter('/admin/labels/:id'), require('lib/layout'));

app.get(forumRouter('/admin/usertype-project'), require('lib/layout'));
app.get(forumRouter('/admin/usertype-project/:id'), require('lib/layout'));