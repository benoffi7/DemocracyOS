/**
 * Module dependencies.
 */

var express = require('express');
var utils = require('lib/utils');
var restrict = utils.restrict;
var staff = utils.staff;
var api = require('lib/db-api');
var expose = utils.expose;
var config = require('lib/config');
var fs = require("fs");
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var log = require('debug')('democracyos:confighome');

var app = module.exports = express();


app.post('/confighome', restrict, staff, upload.single('logo'), function (req, res) {
  log('Request POST api-image/confighome/');
  
  req.body.acercade= JSON.parse(req.body.acercade);
  req.body.comofunciona= JSON.parse(req.body.comofunciona);
  
  api.confighome.update(config.configId, req.body, function (err, confighomeDoc) {
    if (err) return _handleError(err, req, res);
    
    if(req.file){
        fs.rename('uploads/' + req.file.filename, 'uploads/logo');
    }

    log('Serving confighome %s', confighomeDoc.id);
    var keys = [
      'id hash text image logo menuColor acercade acercadeContent comofunciona comofuncionaContent createdAt deletedAt'
    ].join(' ');

    res.json(expose(keys)(confighomeDoc.toJSON()));
  });
})


function _handleError (err, req, res) {
  res.format({
    html: function() {
      // this should be handled better!
      // maybe with flash or even an
      // error page.
      log('Error found with html request %j', err);
      res.redirect('back');
    },
    json: function() {
      log("Error found: %j", err);
      res.json({ error: err });
    }
  })
}
