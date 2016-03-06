import debug from 'debug';
import page from 'page';
import usertypeStore from '../usertype-store/usertype-store';

const log = debug('democracyos:userType-middlewares');

/**
 * Clear tag store, to force a fetch to server on next call
 */

export function clearUsersTypesStore (ctx, next) {
  usertypeStore.clear();
  next();
}

export function findAllUsersTypes(ctx, next) {
  usertypeStore.findAll().then(userstypes => {
    ctx.userstypes = userstypes;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load userTypes`);
  });
}

export function findAllActiveUsersTypes(ctx, next) {
  usertypeStore.findAllActive().then(userstypes => {
    ctx.userstypes = userstypes;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load userTypes`);
  });
}

/**
 * Load specific tag from context params
 */

export function findUserType(ctx, next) {
  usertypeStore
    .findOne(ctx.params.id)
    .then(usertype => {
      ctx.usertype = usertype;
      return next();
    })
    .catch(err => {
      if (404 !== err.status) throw err;
      const message = 'Unable to load userType for ' + ctx.params.id;
      return log(message, err);
    });
}

export function findUserTypeOfUser(ctx, next) {
  usertypeStore
    .findOne(ctx.user.usertype)
    .then(usertype => {
      ctx.usertype = usertype;
      return next();
    })
    .catch(err => {
      if (404 !== err.status) throw err;
      const message = 'Unable to load userType for ' + ctx.params.id;
      return log(message, err);
    });
}


/**
 * Este es usado en topic/:id
 */
export function findUserTypeProposal(ctx, next) {
  if(ctx.topic.author.usertype !== Object(ctx.topic.author.usertype)){
    usertypeStore
      .findOne(ctx.topic.author.usertype)
      .then(usertype => {
        ctx.topic.author.usertype = usertype;
        return next();
      })
      .catch(err => {
        if (404 !== err.status) throw err;
        const message = 'Unable to load userType for ' + ctx.topic.author.usertype.id;
        return log(message, err);
      });
  }else{
      return next();
  }
}