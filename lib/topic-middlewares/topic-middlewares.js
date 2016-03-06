import debug from 'debug';
import config from '../config/config';
import topicStore from '../topic-store/topic-store';
import user from '../user/user';

const log = debug('democracyos:topic-middlewares');

/**
 * Clear topic store, to force a fetch to server on next call
 */

export function clearTopicStore (ctx, next) {
  topicStore.clear();
  next();
}

/**
 * Load private topics from specified Forum.
 * Should only be used by admin modules.
 */
export function findPrivateTopics(ctx, next) {
  if (config.multiForum && !ctx.forum) {
    throw new Error('First you must fetch the current forum.');
  }

  let query = { draft: true };
  if (config.multiForum) query.forum = ctx.forum.id;

  if(!ctx.user.staff && !config.multiForum){
    //Solo devuelvo los topics de usuario
    query.author= ctx.user.id;     
  }
  topicStore.findAll(query).then(topics => {
      ctx.topics = topics;
      next();
    }).catch(err => {
      if (404 !== err.status) throw err;
      log(`Unable to load topics for forum ${ctx.forum.name}`);
  });
}

/**
 * Load public topics from specified Forum
 */
export function findTopics(ctx, next) {
  if (config.multiForum && !ctx.forum) {
    throw new Error('First you must fetch the current forum.');
  }

  let query = {};
  if (config.multiForum) query.forum = ctx.forum.id;

  topicStore.findAll(query).then(topics => {
    ctx.topics = topics;
    next();
  })
}

/**
 * Load public topics from specified Forum
 */
export function findTopicsHome(ctx, next) {
  if (config.multiForum && !ctx.forum) {
    throw new Error('First you must fetch the current forum.');
  }

  let query = {};
  if(config.multiForum) query.forum = ctx.forum.id;
  if(ctx.userProf) query.user= ctx.userProf.id;
  if(ctx.tag) query.tag= ctx.tag.id;

  topicStore.findAllHome(query).then(topics => {
    ctx.topics = topics;
    next();
  })
}

/*
 * Load public topics from specified Forum
 */
export function findTopicsUser(ctx, next) {
  if (config.multiForum && !ctx.forum) {
    throw new Error('First you must fetch the current forum.');
  }

  let query = {};
  if(config.multiForum) query.forum = ctx.forum.id;
  if(ctx.userProf) query.user= ctx.userProf.id

  topicStore.findAllUser(query).then(topics => {
    ctx.userTopics = topics;
    next();
  })
}

export function findTopicsFavorites(ctx, next) {
  if (config.multiForum && !ctx.forum) {
    throw new Error('First you must fetch the current forum.');
  }

  let query = {};
//  if (config.multiForum) query.forum = ctx.forum.id;
  query.user= user.id;

  topicStore.findFavorites(query).then(topics => {
    ctx.topics = topics;
    next();
  })
}

/**
 * Load specific topic from context params
 */

export function findTopic(ctx, next) {
  topicStore
    .findOne(ctx.params.id)
    .then(topic => {
      ctx.topic = topic;
      next();
    })
    .catch(err => {
      if (404 !== err.status) throw err;
      log(`Unable to load topic for ${ctx.params.id}`);
    });
}


/**
 * Load specific topic from context params
 */

export function findTopicProposal(ctx, next) {
  topicStore
    .findOneTopic(ctx.params.hash)
    .then(topic => {
      ctx.topic = topic;
      next();
    })
    .catch(err => {
      if (404 !== err.status) throw err;
      log(`Unable to load topic for ${ctx.params.id}`);
    });
}