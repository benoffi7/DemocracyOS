import debug from 'debug';
import page from 'page';
import projecttypeStore from '../projecttype-store/projecttype-store';

const log = debug('democracyos:projectType-middlewares');

/**
 * Clear tag store, to force a fetch to server on next call
 */

export function clearProjectsTypesStore (ctx, next) {
  projecttypeStore.clear();
  next();
}

export function findAllProjectsTypes(ctx, next) {
  projecttypeStore.findAll().then(projectstypes => {
    ctx.projectstypes = projectstypes;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load projectType`);
  });
}

export function findAllActiveProjectsTypes(ctx, next) {
  projecttypeStore.findAllActive().then(projectstypes => {
    ctx.projectstypes = projectstypes;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load projectType`);
  });
}

export function findAllActiveProjectsTypesOfUsertype(ctx, next) {
  let query = { id: ctx.usertype.id };
  projecttypeStore.findAllActiveOfUsertype(query).then(projectstypes => {
    ctx.projectstypes = projectstypes;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load projectType`);
  });
}

/**
 * Load specific tag from context params
 */

export function findProjectType(ctx, next) {
  projecttypeStore
    .findOne(ctx.params.id)
    .then(projecttype => {
      ctx.projecttype = projecttype;
      return next();
    })
    .catch(err => {
      if (404 !== err.status) throw err;
      const message = 'Unable to load projectType for ' + ctx.params.id;
      return log(message, err);
    });
}