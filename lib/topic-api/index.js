/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var api = require('lib/db-api');
var utils = require('lib/utils');
var accepts = require('lib/accepts');
var restrict = utils.restrict;
var pluck = utils.pluck;
var expose = utils.expose;
var normalize = utils.normalize;
var log = require('debug')('democracyos:topic');
var config = require('lib/config');
var utils = require('lib/utils');
var notifier = require('lib/notifications').notifier;
var migrateTopic = require('lib/migrations/topic');
var hasAccess = require('lib/is-owner').hasAccess;
var Topic = mongoose.model('Topic');
//var Topic = require('lib/models').Topic;

var app = module.exports = express();

/**
 * Limit request to json format only
 */

app.use(accepts('application/json'));

var topicListKeys = [
  'id topicId title hash mediaTitle status open closed public draft deleted forum',
  'tag projecttype author participants voted createdAt updatedAt closingAt',
  'publishedAt deletedAt votable clauseTruncationText links'
].join(' ');

var topicKeys = topicListKeys
              + ' '
              + 'summary clauses source state upvotes downvotes abstentions labels';

function exposeTopic(topicDoc, user, keys) {
  if (!keys) keys = topicKeys;

  var topic = topicDoc.toJSON();
  topic.voted = topicDoc.votedBy(user);

  return expose(keys)(topic);
}

function findForum(req, res, next) {
  if (!config.multiForum) return next();

  if (!mongoose.Types.ObjectId.isValid(req.query.forum)) {
    return _handleError('Must define a valid \'forum\' param.', req, res);
  }

  api.forum.findById(req.query.forum, function(err, forum){
    if (err) return _handleError(err, req, res);
    if (!forum) return _handleError(new Error('Forum not found.'), req, res);

    req.forum = forum;
    next();
  });
}

function onlyForumAdmins(req, res, next) {
  if (!req.user) _handleError(new Error('Unauthorized.1'), req, res);

  if (config.multiForum) {
    if (req.forum.isAdmin(req.user)) return next();
    return _handleError(new Error('Unauthorized.2'), req, res);
  }

  /*
   * Como ahora el usuario comun puede editar los suyos no puedo controlar mas
  if (req.user.staff) return next();
  return _handleError(new Error('Unauthorized. 3'), req, res);
  */
  return next();
}

app.get('/topic/all',
findForum,
function(req, res, next) {
  if (req.query.draft) {
    onlyForumAdmins(req, res, next);
  } else {
    next();
  }
},
function (req, res) {
  log('Request /topic/all');
  params= {forum: req.forum};
  if(req.query.author){
      params.author= req.user;
  }
  api.topic.all(params, function(err, topics) {
    if (err) return _handleError(err, req, res);

    topics = topics.filter(function(topic) {
      if (topic.public) return true;
      if (req.query.draft && topic.draft) return true;
      return false;
    });

    log('Serving topics %j', pluck(topics, 'id'));

    res.json(topics.map(function(topicDoc){
      return exposeTopic(topicDoc, req.user, topicListKeys);
    }));
  });
});


app.get('/topic/allhome',
findForum,
function(req, res, next) {
  if (req.query.draft) {
    onlyForumAdmins(req, res, next);
  } else {
    next();
  }
},
function (req, res) {
  log('Request /topic/allhome');
  params= {forum: req.forum};
  if(req.query.search){
      params.search= req.query.search;
  }
  
  var page = parseInt(req.query.page, 10) || 0;
  //El limit lo mantengo en 3 asi se puede probar - lo podriamos hacer configurable
  var limit = 3;
  
  params.limit= limit,
  params.skip= page * limit
  
  if(req.query.tag){
      params.tag= req.query.tag;
  }
  if(req.query.project){
      params.project= req.query.project;
  }
  if(req.query.user){
      params.user= req.query.user;
  }
  if(req.query.sort && req.query.sortvalue){
      params.sort= req.query.sort;
      params.sortValue= req.query.sortvalue;
  }
  if(req.query.state){
      params.state= req.query.state;
  }
  
  api.topic.allHome(params, function(err, topics) {
    if (err) return _handleError(err, req, res);

    log('Serving topics home %j', pluck(topics, 'id'));

    res.json(topics.map(function(topicDoc){
      return exposeTopic(topicDoc, req.user);
    }));
  });
});


app.get('/topic/alluser',
findForum,
function(req, res, next) {
  if (req.query.draft) {
    onlyForumAdmins(req, res, next);
  } else {
    next();
  }
},
function (req, res) {
  log('Request /topic/alluser');
  params= {forum: req.forum};
  
  if(req.query.user){
      params.user= req.query.user;
  }
    
  api.topic.allUser(params, function(err, topics) {
    if (err) return _handleError(err, req, res);

    log('Serving topics user %j', pluck(topics, 'id'));

    res.json(topics.map(function(topicDoc){
      return exposeTopic(topicDoc, req.user);
    }));
  });
});

app.get('/topic/favorites',
function (req, res) {
  log('Request /topic/favorites');
    
  api.user.get(req.query.user, function (err, user) {
    if(!user)return _handleError(err, req, res);
      
    params= {favorites: user.favorites};
    
    api.topic.favorites(params, function(err, topics) {
      if (err) return _handleError(err, req, res);

      log('Serving topics user %j', pluck(topics, 'id'));

      res.json(topics.map(function(topicDoc){
        return exposeTopic(topicDoc, req.user);
      }));
    });
  })
});

app.get('/topic/hash/:hash', function (req, res) {
  log('Request GET /topic/hash/%s', req.params.hash);

  api.topic.getHash(req.params.hash, function (err, topic) {
    if (err) return _handleError(err, req, res);
    if (!topic) return res.send(404);
    migrateTopic(topic, function (err, topicMigrated) {
      if (err) {
        return _handleError(err, req, res);
      }

      log('Serving topic %s', topicMigrated.id);
      res.json(exposeTopic(topicMigrated, req.user));
    });
  });
});

app.get('/topic/:id', function (req, res) {
  log('Request GET /topic/%s', req.params.id);

  api.topic.get(req.params.id, function (err, topic) {
    if (err) return _handleError(err, req, res);
    if (!topic) return res.send(404);
    migrateTopic(topic, function (err, topicMigrated) {
      if (err) {
        return _handleError(err, req, res);
      }

      log('Serving topic %s', topicMigrated.id);
      res.json(exposeTopic(topicMigrated, req.user));
    });
  });
});

// TODO: Change endpoint -- move to comment-api
app.get('/topic/:id/sidecomments', function (req, res) {
  log('Requesting /topic/%s/sidecomments', req.params.id);
  // var paging = { page: 0, limit: 0, sort: 'createdAt', exclude_user: null };
  api.comment.getSideComments(req.params.id, null, function (err, comments) {
    if (err) return _handleError(err, req, res);
    log('Serving topic %s body\'s comments %j', req.params.id, pluck(comments, 'id'));

    var keys = [
      'id text createdAt editedAt context reference',
      'author.id author.fullName author.displayName author.avatar',
      'flags upvotes downvotes votes replies.length'
    ].join(' ');

    res.json(comments.map(expose(keys)));
  });
});

app.get('/topic/:id/comments', function (req, res) {
  log('Request /topic/%s/comments', req.params.id);

  var sort = '';
  if (~['-score', '-createdAt', 'createdAt'].indexOf(req.query.sort)) {
    sort = req.query.sort;
  } else {
    sort = '-score';
  }

  var paging = {
    page: req.query.page || 0,
    limit: req.query.limit || 0,
    sort: sort,
    exclude_user: req.query.exclude_user || null
  };

  api.topic.comments(req.params.id, paging, function (err, comments) {
    if (err) return _handleError(err, req, res);

    if (!req.query.count) {
      log('Serving topic %s comments %j', req.params.id, pluck(comments, 'id'));

      var keys = [
        "id text createdAt editedAt context reference",
        "author.id author.fullName author.displayName author.avatar",
        "flags upvotes downvotes votes replies.length"
      ].join(' ');

      res.json(comments.map(expose(keys)));
    } else {
      log('Serving topic %s comments count: %d', req.params.id, comments.length);

      res.json(comments.length);
    }
  });
});

app.get('/topic/:id/my-comments', restrict, function (req, res) {
  log('Request /topic/%s/my-comments', req.params.id);

  api.topic.userComments(req.params.id, req.user.id, function (err, comments) {
    if (err) return _handleError(err, req, res);

    log('Serving topic %s comments %j for user %s', req.params.id, pluck(comments, 'id'), req.user.id);

    var keys = [
      "id text createdAt editedAt context reference",
      "author.id author.fullName author.displayName author.avatar",
      "flags upvotes downvotes votes replies.length"
    ].join(' ');

    res.json(comments.map(expose(keys)));
  });
});

app.post('/topic/:id/comment', restrict, function (req, res) {
  log('Request /topic/%s/comment %j', req.params.id, req.body.comment);

  var comment = {
    text: req.body.text,
    context: req.body.context || 'topic',
    reference: req.params.id,
    topicId: req.body.topicId,
    author: req.user.id,
  };

  api.topic.comment(comment, function (err, commentDoc) {
    if (err) return _handleError(err, req, res);
    
    api.topic.getWithForum(comment.reference, function(err, topic) {
        var eventName = 'new-comment';
        var topicUrl = '';
        if (topic.forum) {
            topicUrl = utils.buildUrl(config, { pathname: '/' + topic.forum.name + '/topic/' + topic.hash });
        } else {
            topicUrl = utils.buildUrl(config, { pathname: '/topic/' + topic.hash });
        }

        var data = {
            topic: comment.reference,
            user: req.user.id,
            url: topicUrl
        };

        notifier.notify(eventName)
            .withData(data)
            .send(function (err, data) {
              if (err) {
                log('Error when sending notification for event %s', eventName);
              } else {
                log('Successfully notified comment of topic %s', comment.reference);
              }
        });
    });

    var keys = [
      'id text',
      'author.id author.fullName author.displayName author.avatar',
      'upvotes downvotes flags',
      'createdAt replies context reference'
    ].join(' ');

    res.json(200, expose(keys)(commentDoc));
  });
});

app.post('/topic/:id/vote', restrict, function (req, res) {
  log('Request /topic/%s/vote', req.param('id'));

  api.topic
  .vote(
    req.param('id'),
    req.user,
    req.param('value'),
    function (err, topic) {
      if (err) return _handleError(err, req, res);

      var eventName = 'topic-voted';

      notifier.notify(eventName)
        .withData( { topic: topic.id, user: req.user.id, vote: req.param('value') } )
        .send(function (err, data) {
          if (err) {
            log('Error when sending notification for event %s', eventName);
          } else {
            log('Successfully notified voting of topic %s', topic.id);
          }
        });

      res.json(exposeTopic(topic, req.user));
    }
  );
});

app.post('/topic/create', function (req, res, next) {
  log('Request /topic/create %j', req.body);

  req.body.forum = req.forum;
  //Le paso el usuario logueado
  if(req.user.staff && req.body.imauthor != "on"){
    req.body.author= req.body.users;
  }else{
    req.body.author= req.user._id.toString();    
  }  
  req.body.hash= normalize(req.body.mediaTitle);

  Topic.findOne({hash: req.body.hash}, function(err, topicExists){
    if (err) return _handleError(err, req, res);
    
    if(topicExists){
        res.json(200, { error: 'El topic ya existe' });
    }else{
        api.topic.create(req.body, function (err, topic) {
          if (err) return next(err);
          var keys = [
            'id topicId title mediaTitle body clauses source state',
            'status open closed public draft deleted tag projecttype participants',
            'upvotes downvotes abstentions createdAt updatedAt closingAt',
            'publishedAt deletedAt votable bodyTruncationText links author'
          ].join(' ');
          res.json(exposeTopic(topic, req.user));
        });
    }
  });
});

app.post('/topic/:id', restrict, hasAccess, function (req, res) {
  log('Request POST /topic/%s', req.params.id);

  if(req.user.staff){
    if(req.body.imauthor != "on"){    
      api.user.get(req.body.users, function (err, user) {
          if (err) return _handleError(err, req, res);
          req.body.author= user;
          update();
      });
    }else{
      req.body.author= req.user;
      update();
    }
  }else{
    update();
  }
  
  function update(){    
    req.body.hash= normalize(req.body.mediaTitle); 
     
    Topic.findOne({hash: req.body.hash}, function(err, topicExists){
      if (err) return _handleError(err, req, res);

      if(topicExists && topicExists._id != req.params.id){
        res.json(200, { error: 'El topic ya existe' });
      }else{
        api.topic.update(req.params.id, req.body, function (err, topic) {
          if (err) return _handleError(err, req, res);
          log('Serving topic %s', topic.id);
          res.json(exposeTopic(topic, req.user));
        });
      }
    })
  }
});

app.post('/topic/:id/link', restrict, hasAccess, function (req, res) {
  log('Request POST /topic/%s/link', req.params.id);

  var link = req.body.link;
  api.topic.get(req.params.id, function (err, topicDoc) {
    if (err) return _handleError(err, req, res);

    var linkDoc = link && link.id
      ? topicDoc.links.id(link.id)
      : topicDoc.links.create();

    linkDoc.update(link);
    if (linkDoc.isNew) topicDoc.links.push(linkDoc);

    topicDoc.save(function (err, saved) {
      if (err) return _handleError(err, req, res);

      res.json(200, expose('id text url')(linkDoc));
    });
  });
});

app.delete('/topic/:id/link', restrict, hasAccess, function (req, res) {
  log('Request DELETE /topic/%s/link', req.params.id);

  var link = req.body.link;
  api.topic.get(req.params.id, function (err, topicDoc) {
    if (err) return _handleError(err, req, res);

    topicDoc.links.remove(link);
    log('removed link %s from topic %s', link, topicDoc.id);

    topicDoc.save(function (err, saved) {
      if (err) return _handleError(err, req, res);

      res.json(200);
    });
  });
});

app.post('/topic/:id/publish', restrict, hasAccess, function (req, res) {
  log('Request POST /topic/%s/publish', req.params.id);

  api.topic.get(req.params.id, function (err, topic) {
    if (err) return _handleError(err, req, res);

    topic.publishedAt = new Date;
    topic.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('publish topic %s at %s', topic.id, topic.publishedAt);

      var eventName = 'topic-published';

      var topicUrl = utils.buildUrl(config, { pathname: '/topic/' + topic.hash });

      var data = {
        topic: { mediaTitle: topic.mediaTitle, id: topic.id },
        url: topicUrl
      };

      if (config.deploymentId) {
        data.deploymentId = config.deploymentId;
      }

      notifier.notify(eventName)
        .withData(data)
        .send(function (err) {
          if (err) {
            log('Error when sending notification for event %s', eventName);
          } else {
            log('Successfully notified publishing of topic %s', topic.id);
          }
        });
    });

    res.json(exposeTopic(topic, req.user));
  });
});

app.post('/topic/:id/unpublish', restrict, hasAccess, function (req, res) {
  log('Request POST /topic/%s/unpublish', req.params.id);

  api.topic.get(req.params.id, function (err, topicDoc) {
    if (err) return _handleError(err, req, res);

    topicDoc.publishedAt = null;
    topicDoc.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('unpublished topic %s', topicDoc.id);
      res.json(exposeTopic(topicDoc, req.user));
    });
  });
});

app.post('/topic/:id/addlabel/:labelId', restrict, function (req, res) {
  log('Request POST add label', req.params.id);

  api.topic.get(req.params.id, function (err, topic) {
    if (err) return _handleError(err, req, res);

    topic.addLabel(req.params.labelId);
    topic.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('add label to topic %s', topic.id);
      res.json(200);
    });
  });
});

app.post('/topic/:id/deletelabel/:labelId', restrict, function (req, res) {
  log('Request POST add label', req.params.id);

  api.topic.get(req.params.id, function (err, topic) {
    if (err) return _handleError(err, req, res);

    topic.deleteLabel(req.params.labelId);
    topic.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('add label to topic %s', topic.id);
      res.json(200);
    });
  });
});

app.delete('/topic/:id', restrict, hasAccess, function (req, res) {
  log('Request DEL /topic/%s', req.params.id);

  api.topic.get(req.params.id, function (err, topicDoc) {
    if (err) return _handleError(err, req, res);

    topicDoc.deletedAt = new Date;
    topicDoc.save(function (err, saved) {
      if (err) return _handleError(err, req, res);
      log('deleted topic %s', topicDoc.id);
      res.json(200);
    });
  });
});

function _handleError (err, req, res) {
  log("Error found: %s", err);
  var error = err;
  if (err.errors && err.errors.text) error = err.errors.text;
  if (error.type) error = error.type;

  res.json(400, { error: error });
}
