import debug from 'debug';
import o from 'component-dom';
//import request from '../request/request.js';
import serialize from 'get-form-data';

var request= require('request');

let log = debug('democracyos:autosubmit');

export default function(form, fn, postserialize) {
  var form = o(form);
  var action = form.attr('action');
  var identifier= '#' + form.attr('identifier') + ' form';
//  var method = form.attr('method').toLowerCase();
  var data = serialize(form[0]);
//  console.log(data);
//  if ('delete' == method) {
//    method = 'del';
//  }
//  var req = request[method](action).send(data);
//  req.end((err, res) => fn(err, res));
//  return req;
  
  var elem= $(identifier).get(0);
  var formData= new FormData(elem);
  if (postserialize) formData= postserialize(formData, data);
  $.ajax( {
      url: action,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
//      async: false,
      success: function (rta) {
        fn(null, rta);
        //return JSON.parse(json);
      },
      error: function (xhr, status, error){
        fn(error, xhr);
      }
    } );
  
//  var formData = $("#usertype-wrapper form").get(0);
//  request.post({url: 'http://localhost:3000/apiverga/userstypes/12', formData: formData}, function(error, response, body) {
//    console.log(body);
//  });
  

}
