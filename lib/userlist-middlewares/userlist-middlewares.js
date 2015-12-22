import debug from 'debug';
import page from 'page';
import userlistStore from '../userlist-store/userlist-store';

const log = debug('democracyos:userlist-middlewares');

/**
 * Clear tag store, to force a fetch to server on next call
 */

export function clearUserListStore (ctx, next) {
  userlistStore.clear();
  next();
}

export function findAllUserList(ctx, next) {
  userlistStore.findAll().then(userlist => {
    ctx.userlist = userlist;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load userlist`);
  });
}

export function findAllFilterUserList(ctx, next) {
  ctx.level= ctx.params.level || 0;
  ctx.state= ctx.params.state || 1;
      
  userlistStore.findAllFilter(ctx.level, ctx.state).then(userlist => {
    ctx.userlist = userlist;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load userlist`);
  });
}

/**
 * Load specific tag from context params
 */

export function findUser(ctx, next) {
  userlistStore
    .findOne(ctx.params.id)
    .then(userlist => {
      ctx.userlist = userlist;
      return next();
    })
    .catch(err => {
      if (404 !== err.status) throw err;
      const message = 'Unable to load userlist for ' + ctx.params.id;
      return log(message, err);
    });
}